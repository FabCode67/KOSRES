# ============================================================
#  KOSRES LTD — Complete Contabo Deployment Guide
#  Domain: kosres.com | Server: Contabo Cloud VPS 10
#  Cost: ~$4.95/month (IPv4 included FREE on Contabo)
# ============================================================


## ════════════════════════════════════════════════════════════
## STEP 1 — Order Your Contabo Server
## ════════════════════════════════════════════════════════════

1. Go to https://contabo.com
2. Click "Cloud VPS" in the top menu
3. Select "Cloud VPS 10":
     vCPUs:    3 cores
     RAM:      8 GB
     Storage:  75 GB NVMe
     Traffic:  Unlimited
     Price:    ~$4.95/month
     IPv4:     ✅ INCLUDED FREE (unlike Hetzner)

4. Configure your order:
     Region:         European Union (Germany) ← best for Rwanda
     Storage type:   NVMe SSD (default)
     Operating System: Ubuntu 24.04
     Set Password:   Choose a root password (save it!)

5. Click "Next" → complete payment
6. Wait ~10–15 minutes for provisioning
7. You'll receive an email with:
     - Server IP address (e.g. 194.163.45.23)
     - Root username: root
     - Root password: (what you set)


## ════════════════════════════════════════════════════════════
## STEP 2 — Point kosres.com DNS to Contabo
## ════════════════════════════════════════════════════════════

Login to Namecheap → Domain List → kosres.com → Manage → Advanced DNS

Delete ALL existing records, then add these:

  Type  | Host  | Value              | TTL
  -------|-------|---------------------|------
  A      | @     | YOUR_CONTABO_IP    | Auto
  A      | www   | YOUR_CONTABO_IP    | Auto
  A      | api   | YOUR_CONTABO_IP    | Auto

Replace YOUR_CONTABO_IP with the IP from your Contabo email.

Click "Save All Changes"

Check DNS propagation (wait until all green):
  https://dnschecker.org/#A/kosres.com
  https://dnschecker.org/#A/www.kosres.com
  https://dnschecker.org/#A/api.kosres.com

This can take 5–30 minutes. Continue to Step 3 while waiting.


## ════════════════════════════════════════════════════════════
## STEP 3 — Connect to Your Server via SSH
## ════════════════════════════════════════════════════════════

Open PowerShell or Windows Terminal on your PC:

  ssh root@YOUR_CONTABO_IP

Type "yes" when asked about fingerprint.
Enter your root password.

You are now on the server. Every command below runs on the server
unless it says "On your PC".


## ════════════════════════════════════════════════════════════
## STEP 4 — Upload and Run the Setup Script
## ════════════════════════════════════════════════════════════

### On your PC (open a NEW PowerShell window, keep SSH open):

  scp C:\Users\ericn\Documents\KOSRES\deploy\setup-server.sh root@YOUR_CONTABO_IP:/root/

### Back on the server (SSH window):

  chmod +x /root/setup-server.sh
  bash /root/setup-server.sh

This installs: Node.js 20, PostgreSQL 16, Nginx, PM2, UFW firewall, Fail2ban
Takes about 3–5 minutes.

⚠️  IMPORTANT: When it finishes, it prints a DATABASE PASSWORD.
    COPY AND SAVE IT IMMEDIATELY.
    It looks like:
      DB_PASS     = xK9mP2nRqL8vW5jA3cZ7
      DATABASE_URL = postgresql://kosres_admin:xK9mP2nRqL8vW5jA3cZ7@localhost:5432/kosres

It's also saved at: /root/kosres-env/db-credentials.txt
View it anytime with: cat /root/kosres-env/db-credentials.txt


## ════════════════════════════════════════════════════════════
## STEP 5 — Generate Your Secret Keys
## ════════════════════════════════════════════════════════════

On the server, run this command TWICE.
Use the first output for JWT_SECRET, second for NEXTAUTH_SECRET:

  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Example output:
  a3f8c2e1d4b7f9e6a2c5d8f1e4b7a3f8c2e1d4b7f9e6a2c5d8f1e4b7a3f8c2
  b9e2a5c8f1d4a7e0b3c6f9e2a5c8f1d4a7e0b3c6f9e2a5c8f1d4a7e0b3c6f9

Save both outputs — you need them in Step 6.


## ════════════════════════════════════════════════════════════
## STEP 6 — Create Environment Files on Server
## ════════════════════════════════════════════════════════════

### 6a. Create the SERVER environment file:

  nano /root/kosres-env/server.env

Copy and paste this exactly, replacing the YOUR_... values:
────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://kosres_admin:YOUR_DB_PASSWORD@localhost:5432/kosres
JWT_SECRET=YOUR_FIRST_GENERATED_SECRET
JWT_EXPIRES_IN=dfghjkl
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://www.kosres.com,https://kosres.com
ADMIN_EMAIL=ahjhgfdfg
ADMIN_PASSWORD=YOUR_STRONG_PASSWORD
CLOUDINARY_CLOUD_NAME=dfghj
CLOUDINARY_API_KEY=sdfgh
CLOUDINARY_API_SECRET=erfghjk
SITE_URL=https://www.kosres.com
────────────────────────────────────────────────────────────
Save: press Ctrl+O → Enter → Ctrl+X

Where to get the values:
  YOUR_DB_PASSWORD        → from Step 4 output or: cat /root/kosres-env/db-credentials.txt
  YOUR_FIRST_GENERATED_SECRET  → first output from Step 5
  YOUR_STRONG_PASSWORD    → choose any strong password for admin login


### 6b. Create the CLIENT environment file:

  nano /root/kosres-env/client.env

Copy and paste this exactly:
────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https:test.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=1234567
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=qwertyui
NEXT_PUBLIC_SITE_URL=https://www.kosres.com
NEXTAUTH_URL=httpssdfghjk
NEXTAUTH_SECRET=YOUR_SECOND_GENERATED_SECRET
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=dfghjklkjhgfdfghjkk
NEXT_PUBLIC_GA_MEASUREMENT_ID=
────────────────────────────────────────────────────────────
Save: press Ctrl+O → Enter → Ctrl+X

Where to get the values:
  YOUR_SECOND_GENERATED_SECRET → second output from Step 5

### Lock down permissions:
  chmod 600 /root/kosres-env/server.env
  chmod 600 /root/kosres-env/client.env


## ════════════════════════════════════════════════════════════
## STEP 7 — Push Your Code to GitHub
## ════════════════════════════════════════════════════════════

### On your PC (PowerShell):

  cd C:\Users\ericn\Documents\KOSRES

  git init
  git add .
  git commit -m "KOSRES production ready"

### Create a GitHub repository:
1. Go to https://github.com/new
2. Repository name: KOSRES
3. Set to PRIVATE ← important (contains your code)
4. Do NOT check "Initialize repository"
5. Click "Create repository"

### Push your code:

  git remote add origin https://github.com/YOUR_GITHUB_USERNAME/KOSRES.git
  git branch -M main
  git push -u origin main

If asked for password, use a GitHub Personal Access Token:
  GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  Scopes: check "repo" → Generate → copy the token → use as password


## ════════════════════════════════════════════════════════════
## STEP 8 — Set Your GitHub URL in deploy.sh
## ════════════════════════════════════════════════════════════

### On your PC, open:
  C:\Users\ericn\Documents\KOSRES\deploy\deploy.sh

Find this line:
  REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/KOSRES.git"

Replace YOUR_GITHUB_USERNAME with your actual GitHub username.
Save the file.

### Push the update:
  git add deploy/deploy.sh
  git commit -m "Set GitHub repo URL"
  git push


## ════════════════════════════════════════════════════════════
## STEP 9 — Upload Deploy Scripts to Server
## ════════════════════════════════════════════════════════════

### On your PC:

  scp C:\Users\ericn\Documents\KOSRES\deploy\deploy.sh           root@YOUR_CONTABO_IP:/root/
  scp C:\Users\ericn\Documents\KOSRES\deploy\ecosystem.config.js root@YOUR_CONTABO_IP:/root/
  scp C:\Users\ericn\Documents\KOSRES\deploy\nginx.conf          root@YOUR_CONTABO_IP:/etc/nginx/sites-available/kosres
  scp C:\Users\ericn\Documents\KOSRES\deploy\ssl-setup.sh        root@YOUR_CONTABO_IP:/root/

### On the server:
  chmod +x /root/deploy.sh
  chmod +x /root/ssl-setup.sh


## ════════════════════════════════════════════════════════════
## STEP 10 — Deploy the Application
## ════════════════════════════════════════════════════════════

### On the server:

  bash /root/deploy.sh

This automatically:
  ✓ Clones your code from GitHub
  ✓ Copies env files into the project
  ✓ Installs dependencies
  ✓ Builds NestJS (compiles TypeScript)
  ✓ Runs database migrations (creates all tables)
  ✓ Starts NestJS with PM2 on port 3001
  ✓ Builds Next.js (optimised production build)
  ✓ Starts Next.js with PM2 on port 3000

First run takes 5–10 minutes (building Next.js is slow).
You'll see progress for each step.

When done you'll see:
  ✅ DEPLOY COMPLETE
  ┌─────┬────────────┬─────────┬──────────┐
  │ id  │ name       │ status  │ cpu      │
  ├─────┼────────────┼─────────┼──────────┤
  │ 0   │ kosres-api │ online  │ 0%       │
  │ 1   │ kosres-web │ online  │ 0%       │
  └─────┴────────────┴─────────┴──────────┘


## ════════════════════════════════════════════════════════════
## STEP 11 — Configure Nginx
## ════════════════════════════════════════════════════════════

### On the server:

  # Enable the KOSRES site
  ln -s /etc/nginx/sites-available/kosres /etc/nginx/sites-enabled/kosres

  # Remove default placeholder site
  rm -f /etc/nginx/sites-enabled/default

  # Test the config (must say "syntax is ok")
  nginx -t

  # Apply config
  systemctl reload nginx

  # Quick test (should return HTML)
  curl -I http://YOUR_CONTABO_IP


## ════════════════════════════════════════════════════════════
## STEP 12 — Install SSL Certificate (HTTPS)
## ════════════════════════════════════════════════════════════

⚠️  DNS must be pointing to your server before this step.
    Verify: https://dnschecker.org/#A/kosres.com
    Must show your Contabo IP in green everywhere.

### On the server:

  bash /root/ssl-setup.sh

This gets free SSL certificates for:
  ✓ kosres.com
  ✓ www.kosres.com
  ✓ api.kosres.com

Certificates auto-renew every 90 days automatically.

If it fails with "DNS problem", wait 10 more minutes for DNS
propagation then try again.


## ════════════════════════════════════════════════════════════
## STEP 13 — Verify Everything Works
## ════════════════════════════════════════════════════════════

### On the server:

  # Check both apps are running
  pm2 list

  # Test API directly
  curl http://localhost:3001/api/health
  # Expected: {"status":"ok","timestamp":"...","service":"KOSRES API"}

  # Check recent logs
  pm2 logs kosres-api --lines 20
  pm2 logs kosres-web --lines 20

### In your browser:

  https://www.kosres.com          ← Website loads ✅
  https://api.kosres.com/api/health   ← Returns {"status":"ok"} ✅
  https://api.kosres.com/api/docs     ← Swagger UI ✅
  https://www.kosres.com/admin        ← Admin login page ✅

### Test admin login:
  Go to https://www.kosres.com/admin
  Email:    1234
  Password: YOUR_STRONG_PASSWORD (what you set in server.env)


## ════════════════════════════════════════════════════════════
## DEPLOYING FUTURE UPDATES
## ════════════════════════════════════════════════════════════

Every time you make code changes:

### On your PC:
  git add .
  git commit -m "describe what you changed"
  git push

### On the server:
  ssh root@YOUR_CONTABO_IP
  bash /root/deploy.sh

Zero downtime — PM2 reloads each process gracefully.
Takes 3–5 minutes.


## ════════════════════════════════════════════════════════════
## USEFUL SERVER COMMANDS
## ════════════════════════════════════════════════════════════

# Monitor processes
  pm2 list                    ← see all running apps
  pm2 monit                   ← live CPU/RAM dashboard
  pm2 logs                    ← live log stream
  pm2 logs kosres-api --lines 50  ← last 50 API lines
  pm2 logs kosres-web --lines 50  ← last 50 web lines

# Restart apps
  pm2 restart kosres-api
  pm2 restart kosres-web
  pm2 restart all

# Server resources
  df -h                       ← disk space
  free -h                     ← memory usage
  htop                        ← full resource monitor (Ctrl+C to exit)

# Database
  cat /root/kosres-env/db-credentials.txt   ← view DB password
  sudo -u postgres psql -d kosres           ← connect to database
  \dt                                       ← list tables (inside psql)
  \q                                        ← exit psql

# Manual database backup
  bash /root/backup-db.sh

# List backups
  ls -lh /root/db-backups/

# Nginx
  nginx -t                    ← test config
  systemctl reload nginx      ← apply config changes
  systemctl status nginx      ← check nginx status

# SSL
  certbot certificates        ← check cert status and expiry
  certbot renew --dry-run     ← test renewal without actually renewing


## ════════════════════════════════════════════════════════════
## TROUBLESHOOTING
## ════════════════════════════════════════════════════════════

### Site shows "502 Bad Gateway"
  pm2 list               ← check if apps are online
  pm2 restart all
  pm2 logs --lines 30    ← look for errors

### Site not loading at all
  systemctl status nginx          ← is nginx running?
  nginx -t                        ← config error?
  curl http://localhost:3000       ← is Next.js running locally?

### API errors
  pm2 logs kosres-api --lines 50
  curl http://localhost:3001/api/health

### Database errors
  systemctl status postgresql
  sudo -u postgres psql -d kosres -c "\dt"

### SSL errors
  certbot certificates            ← check expiry dates
  certbot renew                   ← force renew

### Admin login not working
  Check /root/kosres-env/server.env → ADMIN_EMAIL and ADMIN_PASSWORD
  Check /root/kosres-env/client.env → NEXTAUTH_SECRET is set
  pm2 logs kosres-api --lines 30  ← look for auth errors


## ════════════════════════════════════════════════════════════
## COSTS SUMMARY
## ════════════════════════════════════════════════════════════

  Contabo Cloud VPS 10:    $4.95/month
  Public IPv4:             FREE (included on Contabo)
  PostgreSQL:              FREE (runs on same server)
  SSL (Let's Encrypt):     FREE
  Cloudinary images:       FREE (your existing account)
  Domain kosres.com:       ~$12/year (Namecheap, already purchased)
  ─────────────────────────────────────────────────────────
  TOTAL:                   $4.95/month + $1/month domain
                           ≈ $6/month everything included
