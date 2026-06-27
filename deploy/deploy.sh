#!/bin/bash
# ============================================================
#  KOSRES LTD — Application Deploy Script
#  Run on the Hetzner server AFTER setup-server.sh:
#    bash deploy.sh
#  Or for updates:
#    bash deploy.sh update
# ============================================================
set -e

APP_DIR="/var/www/kosres"
REPO_URL="https://github.com/YOUR_USERNAME/KOSRES.git"   # ← change this
BRANCH="main"

echo "====================================="
echo "  KOSRES Deploy — $(date)"
echo "====================================="

# ── Pull latest code ────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  echo "📦 Pulling latest code..."
  cd $APP_DIR
  git fetch origin
  git reset --hard origin/$BRANCH
else
  echo "📦 Cloning repository..."
  git clone -b $BRANCH $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# ── Copy env files (must exist on server already) ───────────
echo "🔑 Copying environment files..."
cp /root/kosres-env/server.env  $APP_DIR/server/.env
cp /root/kosres-env/client.env  $APP_DIR/client/.env.local

# ── Build & start NestJS server ─────────────────────────────
echo "🔨 Building NestJS server..."
cd $APP_DIR/server
npm install --omit=dev
npm run build

echo "🗃️  Running database migrations..."
npm run migration:run

echo "🚀 Starting/reloading NestJS with PM2..."
pm2 describe kosres-api > /dev/null 2>&1 \
  && pm2 reload kosres-api \
  || pm2 start dist/main.js --name kosres-api --max-memory-restart 400M

# ── Build & start Next.js client ────────────────────────────
echo "🔨 Building Next.js client..."
cd $APP_DIR/client
npm install --omit=dev
npm run build

echo "🚀 Starting/reloading Next.js with PM2..."
pm2 describe kosres-web > /dev/null 2>&1 \
  && pm2 reload kosres-web \
  || pm2 start npm --name kosres-web --max-memory-restart 500M -- start

# ── Save PM2 process list ────────────────────────────────────
pm2 save

echo ""
echo "✅ Deploy complete!"
echo ""
pm2 list
