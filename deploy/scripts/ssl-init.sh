#!/bin/bash
# Navoria SSL-Init — händelt Let's Encrypt Wildcard-Zertifikat via IONOS DNS-01
#
# Voraussetzung: IONOS-API-Credentials in /etc/letsencrypt/ionos/credentials.ini

set -euo pipefail

CRED_FILE='/etc/letsencrypt/ionos/credentials.ini'
EMAIL="${LETSENCRYPT_EMAIL:-admin@navoria.de}"

if [ ! -f "$CRED_FILE" ]; then
  echo "✗ IONOS-Credentials fehlen: $CRED_FILE"
  echo ''
  echo 'Bitte erstelle die Datei mit deinen IONOS API Keys:'
  echo ''
  echo '  mkdir -p /etc/letsencrypt/ionos'
  echo "  cat > $CRED_FILE <<EOF"
  echo '  dns_ionos_prefix = DEIN_PREFIX_HIER'
  echo '  dns_ionos_secret = DEIN_SECRET_HIER'
  echo '  dns_ionos_endpoint = https://api.hosting.ionos.com'
  echo '  EOF'
  echo "  chmod 600 $CRED_FILE"
  echo ''
  echo 'API Keys erstellen: https://developer.hosting.ionos.de/keys'
  exit 1
fi

echo '→ Request Wildcard SSL-Certificate for navoria.de + *.navoria.de'
certbot certonly \
  --authenticator dns-ionos \
  --dns-ionos-credentials "$CRED_FILE" \
  --dns-ionos-propagation-seconds 120 \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --keep-until-expiring \
  -d navoria.de \
  -d '*.navoria.de'

# Deploy-Hook installieren: Nginx nach Renewal automatisch reloaden
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo ''
echo '✅ SSL-Cert installiert:'
ls -lah /etc/letsencrypt/live/navoria.de/
echo ''
echo 'Testen des Auto-Renewals:'
echo '  certbot renew --dry-run'
