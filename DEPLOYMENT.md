# KOSRES LTD — Production Deployment Guide

## Option A: Vercel (frontend) + Railway (backend) — RECOMMENDED

### Step 1 — Deploy NestJS to Railway

1. Go to https://railway.app → Sign up → New Project
2. Click "Deploy from GitHub repo" → select your KOSRES repo
3. Select the `server` folder as root directory
4. Add these environment variables in Railway dashboard:

```
DATABASE_URL=postgresql://neondb_owner:npg_0JwneZ5tgiYd@ep-orange-bird-aqcfwyuk-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=kosres_jwt_secret_change_in_production_2024_CHANGE_THIS
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://www.kosres.rw
ADMIN_EMAIL=admin@kosres.rw
ADMIN_PASSWORD=Admin@Kosres2024
CLOUDINARY_CLOUD_NAME=dnhpmvk2p
CLOUDINARY_API_KEY=183874587386655
CLOUDINARY_API_SECRET=4VsPE1f1NsmFOA2i5zujkE_pOao
```

5. Railway gives you a URL like: https://kosres-server.railway.app
6. Run migration: Railway dashboard → your service → "Run command" → `npm run migration:run`

---

### Step 2 — Deploy Next.js to Vercel

1. Go to https://vercel.com → Sign up → New Project
2. Import your GitHub repo → select the `client` folder as root directory
3. Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://kosres-server.railway.app/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnhpmvk2p
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kosres_unsigned
NEXTAUTH_URL=https://www.kosres.rw
NEXTAUTH_SECRET=GENERATE_A_STRONG_RANDOM_SECRET_HERE
```

4. Deploy → Vercel gives you https://kosres.vercel.app
5. Add your custom domain: kosres.rw in Vercel dashboard → Domains

---

## Option B: DigitalOcean Droplet (full control, $12/month)

### Step 1 — Create Droplet
1. Go to https://digitalocean.com → Create Droplet
2. Choose: Ubuntu 24.04, Basic plan, $12/month (2GB RAM, 1 CPU, 50GB SSD)
3. Choose region: closest to Rwanda → Frankfurt or Johannesburg
4. Add your SSH key

### Step 2 — Setup server (run these commands via SSH)

```bash
ssh root@YOUR_DROPLET_IP

# Update & install Node.js 20
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx certbot python3-certbot-nginx

# Install PM2 (process manager)
npm install -g pm2

# Clone your repo
git clone https://github.com/YOUR_USERNAME/KOSRES.git /var/www/kosres
cd /var/www/kosres

# ── Build NestJS ──
cd server
cp .env.production .env
npm install
npm run build
npm run migration:run
pm2 start dist/main.js --name kosres-api
pm2 save

# ── Build Next.js ──
cd ../client
cp .env.production .env.local
npm install
npm run build
pm2 start npm --name kosres-web -- start
pm2 save

# Auto-start on reboot
pm2 startup
```

### Step 3 — Nginx config
```bash
nano /etc/nginx/sites-available/kosres
```

Paste:
```nginx
# API (NestJS)
server {
    server_name api.kosres.rw;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }
}

# Frontend (Next.js)
server {
    server_name kosres.rw www.kosres.rw;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/kosres /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Free SSL certificate
certbot --nginx -d kosres.rw -d www.kosres.rw -d api.kosres.rw
```

### Step 4 — Point your domain
In your domain registrar (Afrinic / GoDaddy etc.), add:
- A record: `@` → YOUR_DROPLET_IP
- A record: `www` → YOUR_DROPLET_IP
- A record: `api` → YOUR_DROPLET_IP

---

## Option C: DigitalOcean App Platform (easiest, no Linux knowledge)

1. Go to digitalocean.com → App Platform → New App
2. Connect GitHub → select KOSRES repo
3. Add two components:
   - Web Service (server folder) — $12/month
   - Static Site or Web Service (client folder) — $5/month
4. Add environment variables in the dashboard
5. Done — DigitalOcean handles SSL, deployments, scaling

**Cost: ~$17/month**

---

## Domain Setup (all options)

Register kosres.rw at:
- https://www.ricta.org.rw (Rwanda domain registry)
- Cost: ~$30/year for .rw domain

Or use kosres.com / kosres.net at:
- https://namecheap.com (~$12/year)
- https://godaddy.com (~$15/year)

---

## Production Checklist

- [ ] Change JWT_SECRET to a strong random string (openssl rand -base64 32)
- [ ] Change NEXTAUTH_SECRET to a strong random string
- [ ] Change ADMIN_PASSWORD to a strong password
- [ ] Enable Neon connection pooling (already in your DATABASE_URL)
- [ ] Set NODE_ENV=production
- [ ] Add your domain to CORS settings in NestJS
- [ ] Set up Google Search Console with your domain
- [ ] Add Google Analytics (optional)
- [ ] Set up automated DB backups on Neon dashboard
