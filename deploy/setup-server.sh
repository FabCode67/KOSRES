#!/bin/bash
# ============================================================
#  KOSRES LTD — Hetzner VPS Initial Setup Script
#  Run as root on a fresh Ubuntu 24.04 server:
#    bash setup-server.sh
# ============================================================
set -e

echo "====================================="
echo "  KOSRES Hetzner Server Setup"
echo "====================================="

# ── 1. System update ────────────────────────────────────────
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ufw fail2ban

# ── 2. Node.js 20 ───────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node: $(node -v) | NPM: $(npm -v)"

# ── 3. PM2 (process manager) ────────────────────────────────
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ── 4. App directory ────────────────────────────────────────
mkdir -p /var/www/kosres
echo "App directory created at /var/www/kosres"

# ── 5. Firewall ─────────────────────────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "Firewall enabled"

# ── 6. Fail2ban (brute-force protection) ────────────────────
systemctl enable fail2ban
systemctl start fail2ban

echo ""
echo "✅ Server base setup complete!"
echo "Next: run deploy.sh to deploy the application"
