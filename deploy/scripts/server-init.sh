#!/bin/bash
# Navoria Server-Init-Script für Ubuntu 24.04 LTS — mit CADDY (kein Nginx)
#
# Anwendung: Auf frischem Ubuntu-VPS als root ausführen.
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
  debian-keyring debian-archive-keyring apt-transport-https

# ---------- Docker Engine + Compose Plugin ----------
echo '→ Install Docker Engine'
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

# ---------- Caddy ----------
echo '→ Install Caddy Webserver'
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy
systemctl enable caddy

# ---------- UFW Firewall ----------
echo '→ Configure UFW firewall'
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP (Redirect zu HTTPS + ACME-Challenge)
ufw allow 443/tcp   # HTTPS
ufw allow 443/udp   # HTTP/3 (QUIC)
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
mkdir -p /opt/navoria/backups /var/log/caddy
chmod 700 /opt/navoria/backups
chown caddy:caddy /var/log/caddy

echo ''
echo '✅ Server-Setup fertig.'
echo ''
echo 'Nächste Schritte:'
echo '  1. cp /opt/navoria/deploy/.env.example /opt/navoria/deploy/.env && nano /opt/navoria/deploy/.env'
echo '  2. cp /opt/navoria/deploy/Caddyfile /etc/caddy/Caddyfile'
echo '  3. mongo-Restore (siehe deploy/README.md Schritt 5)'
echo '  4. cd /opt/navoria && docker compose -f deploy/docker-compose.yml up -d --build'
echo '  5. systemctl restart caddy    # holt automatisch SSL-Certs beim ersten HTTPS-Request'
echo ''
echo 'Verifikation:'
echo '  curl -sI https://navoria.de/'
echo '  curl -sI https://<praxis-slug>.navoria.de/'
