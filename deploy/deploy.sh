#!/bin/bash
# ============================================================
#  KOSRES LTD — Deploy / Update Script
#  First deploy:  bash deploy.sh
#  Future updates: bash deploy.sh  (same command, zero downtime)
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
step() { echo -e "\n${RED}[→]${NC} $1"; }

APP_DIR="/var/www/kosres"
REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/KOSRES.git"  # ← CHANGE THIS
BRANCH="main"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   KOSRES Deploy — $(date '+%d/%m/%Y %H:%M')         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Check env files exist ─────────────────────────────────────
if [ ! -f /root/kosres-env/server.env ]; then
  echo -e "${RED}ERROR:${NC} /root/kosres-env/server.env not found!"
  echo "Create it first — see CONTABO-GUIDE.md Step 5"
  exit 1
fi
if [ ! -f /root/kosres-env/client.env ]; then
  echo -e "${RED}ERROR:${NC} /root/kosres-env/client.env not found!"
  echo "Create it first — see CONTABO-GUIDE.md Step 5"
  exit 1
fi

# ── Pull / clone code ─────────────────────────────────────────
step "Getting latest code from GitHub..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR
  git fetch origin
  git reset --hard origin/$BRANCH
  log "Code updated"
else
  git clone -b $BRANCH $REPO_URL $APP_DIR
  cd $APP_DIR
  log "Repository cloned"
fi

# ── Copy env files ────────────────────────────────────────────
step "Copying environment files..."
cp /root/kosres-env/server.env  $APP_DIR/server/.env
cp /root/kosres-env/client.env  $APP_DIR/client/.env.local
log "Environment files copied"

# ── Build NestJS ──────────────────────────────────────────────
step "Building NestJS API..."
cd $APP_DIR/server
npm install --omit=dev
npm run build
log "NestJS built"

# ── Run migrations ────────────────────────────────────────────
step "Running database migrations..."
npm run migration:run
log "Migrations complete"

# ── Start / reload NestJS ─────────────────────────────────────
step "Starting NestJS with PM2..."
if pm2 describe kosres-api > /dev/null 2>&1; then
  pm2 reload kosres-api --update-env
  log "kosres-api reloaded (zero downtime)"
else
  pm2 start dist/main.js \
    --name kosres-api \
    --max-memory-restart 400M \
    --log /var/log/kosres/api.log \
    --error /var/log/kosres/api-error.log \
    --time
  log "kosres-api started"
fi

# ── Build Next.js ─────────────────────────────────────────────
step "Building Next.js frontend..."
cd $APP_DIR/client
npm install --omit=dev
npm run build
log "Next.js built"

# ── Start / reload Next.js ────────────────────────────────────
step "Starting Next.js with PM2..."
if pm2 describe kosres-web > /dev/null 2>&1; then
  pm2 reload kosres-web --update-env
  log "kosres-web reloaded (zero downtime)"
else
  pm2 start npm \
    --name kosres-web \
    --max-memory-restart 500M \
    --log /var/log/kosres/web.log \
    --error /var/log/kosres/web-error.log \
    --time \
    -- start
  log "kosres-web started"
fi

# ── Save PM2 state ────────────────────────────────────────────
pm2 save
log "PM2 state saved (auto-restarts on reboot)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOY COMPLETE                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
pm2 list
echo ""
echo "  🌍 Website: https://www.kosres.com"
echo "  🔌 API:     https://api.kosres.com/api"
echo "  📚 Swagger: https://api.kosres.com/api/docs"
echo "  📋 Logs:    pm2 logs"
echo ""
