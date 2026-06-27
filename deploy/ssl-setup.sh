#!/bin/bash
# ============================================================
#  KOSRES LTD — SSL Certificate Setup
#  Run AFTER nginx is installed and DNS is pointing to server
#    bash ssl-setup.sh yourdomain.com
# ============================================================

DOMAIN=${1:-"kosres.rw"}

echo "Setting up SSL for $DOMAIN and www.$DOMAIN and api.$DOMAIN..."

certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d api.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email admin@$DOMAIN \
  --redirect

# Auto-renew cron (certbot usually sets this up, but just in case)
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo ""
echo "✅ SSL certificates installed!"
echo "Certificates auto-renew via cron every night at 3am"
