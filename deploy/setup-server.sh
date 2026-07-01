#!/bin/bash
# ============================================================
#  KOSRES LTD — Contabo VPS Full Setup Script (FIXED)
#  Run on a FRESH Ubuntu 24.04 server as root:
#    bash setup-server.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
step() { echo -e "\n${RED}[→]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   KOSRES Contabo Server Setup        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. System update ─────────────────────────────────────────
step "Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git wget gnupg2 lsb-release ca-certificates \
               nginx certbot python3-certbot-nginx \
               ufw fail2ban htop nano unzip
log "System packages installed"

# ── 2. Node.js 20 ────────────────────────────────────────────
step "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
log "Node: $(node -v) | NPM: $(npm -v)"

# ── 3. PM2 ───────────────────────────────────────────────────
step "Installing PM2 process manager..."
npm install -g pm2

# FIX: do NOT pipe pm2 startup output to bash — run directly
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
systemctl enable pm2-root 2>/dev/null || true
log "PM2 installed and startup configured"

# ── 4. PostgreSQL 16 ─────────────────────────────────────────
step "Installing PostgreSQL 16..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL 16 installed and running"

# ── 5. Create KOSRES database ────────────────────────────────
step "Creating KOSRES database and user..."
DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)

sudo -u postgres psql -c "CREATE DATABASE kosres;"
sudo -u postgres psql -c "CREATE USER kosres_admin WITH ENCRYPTED PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kosres TO kosres_admin;"
sudo -u postgres psql -c "ALTER DATABASE kosres OWNER TO kosres_admin;"

log "Database and user created"

# ── 6. Save credentials ──────────────────────────────────────
mkdir -p /root/kosres-env
cat > /root/kosres-env/db-credentials.txt << EOF
DB_PASS=${DB_PASS}
DATABASE_URL=postgresql://kosres_admin:${DB_PASS}@localhost:5432/kosres
EOF
chmod 600 /root/kosres-env/db-credentials.txt

echo ""
warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
warn "  SAVE THIS — your database password:"
warn "  DB_PASS      = ${DB_PASS}"
warn "  DATABASE_URL = postgresql://kosres_admin:${DB_PASS}@localhost:5432/kosres"
warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 7. Secure PostgreSQL ──────────────────────────────────────
step "Securing PostgreSQL (localhost only)..."
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" $PG_CONF
sed -i "s/listen_addresses = '\*'/listen_addresses = 'localhost'/" $PG_CONF
systemctl restart postgresql
log "PostgreSQL secured"

# ── 8. Daily backups ─────────────────────────────────────────
step "Setting up daily database backups..."
mkdir -p /root/db-backups
cat > /root/backup-db.sh << 'BACKUP'
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M)
DB_PASS=$(grep "^DB_PASS=" /root/kosres-env/db-credentials.txt | cut -d= -f2)
PGPASSWORD="${DB_PASS}" pg_dump -U kosres_admin -h localhost kosres \
  | gzip > /root/db-backups/kosres-${DATE}.sql.gz
find /root/db-backups -name "*.sql.gz" -mtime +14 -delete
echo "[$(date)] Backup done: kosres-${DATE}.sql.gz"
BACKUP
chmod +x /root/backup-db.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh >> /var/log/kosres-backup.log 2>&1") | crontab -
log "Daily backups at 2:00 AM"

# ── 9. App directories ────────────────────────────────────────
step "Creating directories..."
mkdir -p /var/www/kosres
mkdir -p /var/log/kosres
log "Directories created"

# ── 10. Firewall ─────────────────────────────────────────────
step "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log "Firewall enabled"

# ── 11. Fail2ban ─────────────────────────────────────────────
step "Configuring Fail2ban..."
cat > /etc/fail2ban/jail.local << 'F2B'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
F2B
systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban configured"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              ✅ SERVER SETUP COMPLETE                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Your DB credentials:"
cat /root/kosres-env/db-credentials.txt
echo ""
echo "  NEXT STEPS:"
echo "  1. Generate secrets:"
echo "     node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo "     (run twice — one for JWT_SECRET, one for NEXTAUTH_SECRET)"
echo ""
echo "  2. Create: nano /root/kosres-env/server.env"
echo "  3. Create: nano /root/kosres-env/client.env"
echo "  4. Upload deploy.sh then run: bash /root/deploy.sh"
echo ""
