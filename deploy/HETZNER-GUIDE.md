# ============================================================
#  KOSRES LTD — Hetzner Production Deployment Guide
#  Complete step-by-step from zero to live
# ============================================================

## RECOMMENDED SERVER

Hetzner CX22 — €4.51/month (~$5)
  - 2 vCPUs, 4GB RAM, 40GB SSD
  - Location: Falkenstein, Germany (best latency to Africa)
  - More than enough for KOSRES at launch

Order at: https://hetzner.com/cloud
Create account → Cloud → New Server → CX22 → Ubuntu 24.04

---

## STEP 1 — Create the Server

1. Go to https://console.hetzner.cloud
2. New Project → name it "KOSRES"
3. Add Server:
   - Location: Falkenstein (FSN1) — closest to Rwanda
   - Image: Ubuntu 24.04
   - Type: Shared CPU → CX22 (€4.51/mo)
   - SSH Key: add your public key (cat ~/.ssh/id_rsa.pub)
   - Name: kosres-prod
4. Click Create — note your server IP

---

## STEP 2 — Point Your Domain to Hetzner

In your domain registrar (where you bought kosres.rw), add these DNS records:

  Type  | Name  | Value
  ------|-------|------------------
  A     | @     | YOUR_SERVER_IP
  A     | www   | YOUR_SERVER_IP
  A     | api   | YOUR_SERVER_IP

Wait 5–15 minutes for DNS to propagate.
Check: https://dnschecker.org

---

## STEP 3 — Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

---

## STEP 4 — Run Server Setup Script

```bash
# Upload the setup script
scp deploy/setup-server.sh root@YOUR_SERVER_IP:/root/

# Run it on the server
ssh root@YOUR_SERVER_IP
bash setup-server.sh
```

---

## STEP 5 — Upload Environment Variables

Create secure env files on the server (NEVER commit these to git):

```bash
ssh root@YOUR_SERVER_IP

mkdir -p /root/kosres-env

# Server environment
cat > /root/kosres-env/server.env << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_0JwneZ5tgiYd@ep-orange-bird-aqcfwyuk-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=PASTE_YOUR_STRONG_SECRET_HERE
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://www.kosres.rw
ADMIN_EMAIL=admin@kosres.rw
ADMIN_PASSWORD=PASTE_YOUR_STRONG_PASSWORD_HERE
CLOUDINARY_CLOUD_NAME=dnhpmvk2p
CLOUDINARY_API_KEY=183874587386655
CLOUDINARY_API_SECRET=4VsPE1f1NsmFOA2i5zujkE_pOao
EOF

# Client environment
cat > /root/kosres-env/client.env << 'EOF'
NEXT_PUBLIC_API_URL=https://api.kosres.rw/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnhpmvk2p
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kosres_unsigned
NEXTAUTH_URL=https://www.kosres.rw
NEXTAUTH_SECRET=PASTE_YOUR_STRONG_SECRET_HERE
EOF

# Lock down permissions
chmod 600 /root/kosres-env/*
```

Generate strong secrets:
```bash
# Run this twice — use one for JWT_SECRET, one for NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## STEP 6 — Push Code to GitHub

```bash
# On your local machine (Windows)
cd C:\Users\ericn\Documents\KOSRES

git init
git add .
git commit -m "Initial KOSRES production commit"

# Create repo at github.com then:
git remote add origin https://github.com/YOUR_USERNAME/KOSRES.git
git push -u origin main
```

---

## STEP 7 — Deploy the Application

```bash
# Upload deploy scripts to server
scp deploy/deploy.sh root@YOUR_SERVER_IP:/root/
scp deploy/ecosystem.config.js root@YOUR_SERVER_IP:/root/

# SSH into server and deploy
ssh root@YOUR_SERVER_IP

# Edit deploy.sh to set your GitHub repo URL
nano /root/deploy.sh
# Change: REPO_URL="https://github.com/YOUR_USERNAME/KOSRES.git"

bash /root/deploy.sh
```

---

## STEP 8 — Configure Nginx

```bash
# Upload nginx config
scp deploy/nginx.conf root@YOUR_SERVER_IP:/etc/nginx/sites-available/kosres

# On the server:
ssh root@YOUR_SERVER_IP

# Enable the site
ln -s /etc/nginx/sites-available/kosres /etc/nginx/sites-enabled/kosres

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## STEP 9 — Install SSL Certificate

```bash
# On the server (DNS must be pointing to server first):
scp deploy/ssl-setup.sh root@YOUR_SERVER_IP:/root/
ssh root@YOUR_SERVER_IP
bash ssl-setup.sh kosres.rw
```

---

## STEP 10 — Create Log Directory

```bash
mkdir -p /var/log/kosres
```

---

## STEP 11 — Start with PM2 Ecosystem

```bash
# On the server:
cp /root/ecosystem.config.js /var/www/kosres/

cd /var/www/kosres
pm2 start ecosystem.config.js
pm2 save
pm2 list
```

---

## STEP 12 — Verify Everything Works

```bash
# Check processes
pm2 list

# Check API health
curl https://api.kosres.rw/api/health

# Check logs
pm2 logs kosres-api --lines 50
pm2 logs kosres-web --lines 50
```

Open https://www.kosres.rw in your browser — you're live! 🎉

---

## UPDATING THE APP (after code changes)

```bash
ssh root@YOUR_SERVER_IP
bash /root/deploy.sh
```

That's it — pulls latest code, rebuilds, reloads with zero downtime.

---

## MONITORING & MAINTENANCE

```bash
# Live process monitor
pm2 monit

# View recent logs
pm2 logs --lines 100

# Restart a service
pm2 restart kosres-api
pm2 restart kosres-web

# Check disk space
df -h

# Check memory
free -h

# Check nginx
systemctl status nginx
```

---

## COSTS SUMMARY

| Item              | Cost         |
|-------------------|--------------|
| Hetzner CX22      | €4.51/month  |
| Neon PostgreSQL   | Free         |
| Cloudinary        | Free         |
| SSL (Let's Encrypt)| Free        |
| Domain kosres.rw  | ~$30/year    |
| **TOTAL**         | **~€5/month**|

---

## HETZNER CX22 SPECS (more than enough)

- 2 AMD vCPUs
- 4 GB RAM
- 40 GB SSD
- 20 TB traffic/month
- Ubuntu 24.04
- Falkenstein, Germany datacenter
- 99.9% uptime SLA
