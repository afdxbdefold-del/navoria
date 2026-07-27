#!/bin/bash
# Navoria Server-Init-Script für Ubuntu 24.04 LTS
# Installiert: Docker, Docker Compose, Nginx, Certbot + IONOS Plugin, UFW-Firewall
#
# Anwendung: Auf frischem Hetzner CX22 als root ausführen.
#   scp -r deploy/ root@<ip>:/opt/navoria/
#   ssh root@<ip>
#   cd /opt/navoria && bash deploy/scripts/server-init.sh

set -euo pipefail

echo '→ Update system'
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo '→ Install base packages'
apt-get install -y \
  curl wget git ca-certificates gnupg lsb-release \
  ufw fail2ban htop unattended-upgrades \
  python3-pip python3-venv \
  nginx

# ---------- Docker Engine + Compose Plugin ----------
echo '→ Install Docker Engine'
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

# ---------- Certbot + IONOS Plugin ----------
echo '→ Install Certbot + IONOS DNS Plugin'
# Certbot via snap ist bequemer, aber wir nehmen pip (funktioniert auch ohne snap).
pip3 install --break-system-packages certbot certbot-dns-ionos

# ---------- UFW Firewall ----------
echo '→ Configure UFW firewall'
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ---------- Fail2Ban für SSH-Schutz ----------
echo '→ Configure Fail2Ban'
cat > /etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600
findtime = 600
EOF
systemctl enable --now fail2ban

# ---------- Unattended Security-Updates ----------
echo '→ Enable unattended security upgrades'
dpkg-reconfigure -f noninteractive unattended-upgrades

# ---------- Backup-Verzeichnis ----------
mkdir -p /opt/navoria/backups
chmod 700 /opt/navoria/backups

# ---------- Nginx default disable ----------
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx

echo ''
echo '✅ Server-Setup fertig.'
echo ''
echo 'Nächste Schritte:'
echo '  1. cp /opt/navoria/deploy/.env.example /opt/navoria/deploy/.env && nano /opt/navoria/deploy/.env'
echo '  2. IONOS-Credentials in /etc/letsencrypt/ionos/credentials.ini hinterlegen (siehe README)'
echo '  3. bash /opt/navoria/deploy/scripts/ssl-init.sh'
echo '  4. cp /opt/navoria/deploy/nginx/navoria.conf /etc/nginx/sites-available/navoria'
echo '     && ln -sf /etc/nginx/sites-available/navoria /etc/nginx/sites-enabled/'
echo '     && nginx -t && systemctl reload nginx'
echo '  5. mongo-Restore (siehe deploy/README.md Schritt 5)'
echo '  6. cd /opt/navoria && docker compose up -d --build'
