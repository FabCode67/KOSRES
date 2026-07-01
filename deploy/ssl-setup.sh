#!/bin/bash
# ============================================================
#  KOSRES LTD — SSL Certificate Setup (kosres.com)
#  Run AFTER nginx is installed AND DNS is pointing to server
#    bash ssl-setup.sh
# ============================================================
set -e

DOMAIN="kosres.com"
EMAIL="admin@kosres.com"

echo "Installing SSL certificates for:"
echo "  $DOMAIN, www.$DOMAIN, api.$DOMAIN"
echo ""

certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d api.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --redirect

# Auto-renew cron
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo ""
echo "✅ SSL installed for $DOMAIN, www.$DOMAIN, api.$DOMAIN"
echo "   Auto-renews nightly at 3:00 AM"
