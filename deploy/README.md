# Navoria Deployment auf Hetzner (Docker Compose + Nginx + Wildcard-SSL via IONOS DNS)

**Ziel-Setup:**
- Hetzner CX22 (2 vCPU, 4 GB RAM, 40 GB SSD, Ubuntu 24.04)
- Docker Compose für Next.js-App + MongoDB
- Nginx als Reverse-Proxy auf dem Host (nicht im Container – vereinfacht SSL-Renewal)
- Let's Encrypt Wildcard-Cert für `navoria.de` + `*.navoria.de` via DNS-01 mit IONOS-API-Plugin
- Tägliches MongoDB-Backup (Cronjob)

## 📋 Voraussetzungen

Bevor du beginnst, brauchst du:

1. **Hetzner CX22 Server** — Ubuntu 24.04 LTS, öffentliche IPv4 (z. B. `128.140.x.y`)
2. **SSH-Zugang** als root oder sudo-User
3. **IONOS API Keys**:
   - IONOS-Web-Panel → **DNS API Keys** anlegen unter https://developer.hosting.ionos.de/keys
   - Du bekommst: `ionos_prefix` und `ionos_secret`
4. **DNS-Records bei IONOS**:
   - A-Record: `navoria.de` → Server-IP
   - A-Record: `*.navoria.de` → Server-IP (Wildcard!)
   - (TTL 300 Sekunden für schnelle Änderungen)
5. **mongodump aus der aktuellen Preview-Umgebung** (Anleitung unter Schritt 5)

---

## 🚀 Schritt-für-Schritt-Anleitung

### Schritt 1: Server initialisieren

Auf dem Hetzner-Server als root:

```bash
# Repo klonen (oder Files per scp hochladen)
apt-get update && apt-get install -y git
cd /opt
git clone <deine-repo-url> navoria
cd navoria

# Server-Init-Script ausführen (installiert Docker, Nginx, Certbot, konfiguriert Firewall)
bash deploy/scripts/server-init.sh
```

Das Script macht folgendes:
- Installiert Docker Engine + Docker Compose Plugin
- Installiert Nginx (host-nativ, nicht in Docker)
- Installiert Certbot + `certbot-dns-ionos` Plugin (via pip)
- UFW-Firewall konfigurieren (nur SSH/80/443 offen)
- Erstellt Systemd-Service für Auto-Start

### Schritt 2: Environment-Variablen setzen

```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Trage ein:
- `MONGO_URL=mongodb://mongo:27017` (Docker-internes Netz)
- `DB_NAME=navoria_db`
- `ADMIN_PASSWORD=<sicheres-passwort>`
- `NEXT_PUBLIC_BASE_URL=https://navoria.de`
- `OUTSCRAPER_API_KEY=...`
- `GOOGLE_PLACES_API_KEY=...`
- Alle weiteren Keys aus der aktuellen `/app/.env`

### Schritt 3: SSL-Zertifikat erstellen (Wildcard)

```bash
# IONOS-Credentials für certbot hinterlegen
mkdir -p /etc/letsencrypt/ionos
cat > /etc/letsencrypt/ionos/credentials.ini <<EOF
dns_ionos_prefix = DEIN_PREFIX_HIER
dns_ionos_secret = DEIN_SECRET_HIER
dns_ionos_endpoint = https://api.hosting.ionos.com
EOF
chmod 600 /etc/letsencrypt/ionos/credentials.ini

# Zertifikat anfordern (Wildcard + Root-Domain)
certbot certonly \
  --authenticator dns-ionos \
  --dns-ionos-credentials /etc/letsencrypt/ionos/credentials.ini \
  --dns-ionos-propagation-seconds 120 \
  --email dein@email.de \
  --agree-tos \
  --no-eff-email \
  -d navoria.de \
  -d '*.navoria.de'
```

Der Zertifikat-Pfad ist danach: `/etc/letsencrypt/live/navoria.de/{fullchain,privkey}.pem`

### Schritt 4: Nginx konfigurieren

```bash
# Nginx-Config kopieren
cp deploy/nginx/navoria.conf /etc/nginx/sites-available/navoria
ln -sf /etc/nginx/sites-available/navoria /etc/nginx/sites-enabled/navoria
rm -f /etc/nginx/sites-enabled/default

# Config testen und reloaden
nginx -t && systemctl reload nginx
```

### Schritt 5: Datenbank-Migration (Preview → Prod)

**Auf dem aktuellen Preview-Server (Emergent):**
```bash
# Dump erstellen
mongodump --uri="mongodb://localhost:27017" --db=navoria_db --archive=navoria-dump.gz --gzip
```

**Übertragen:**
```bash
scp navoria-dump.gz root@<hetzner-ip>:/opt/navoria/
```

**Auf dem Hetzner-Server:**
```bash
cd /opt/navoria

# App-Stack starten (nur MongoDB Container braucht man für Restore)
docker compose up -d mongo

# Restore in den MongoDB-Container
docker compose exec -T mongo mongorestore --archive --gzip --drop < navoria-dump.gz
rm navoria-dump.gz   # aus Sicherheitsgründen löschen
```

### Schritt 6: App bauen und starten

```bash
cd /opt/navoria
docker compose build
docker compose up -d

# Logs prüfen
docker compose logs -f app
```

Die App läuft nun intern auf `localhost:3000`. Nginx reverse-proxied `navoria.de` und `*.navoria.de` dorthin.

### Schritt 7: Verifizieren

```bash
# Root-Domain
curl -sI https://navoria.de/ | head -5

# Wildcard-Subdomain
curl -sI https://jaroslaw-raczynski.navoria.de/ | head -5

# Health-Check
docker compose ps
```

Beide sollten `HTTP/2 200` liefern.

### Schritt 8: Automatische Backups aktivieren

```bash
# Cronjob installieren (täglich 3:15 Uhr Backup)
crontab -e
# Diese Zeile hinzufügen:
15 3 * * * /opt/navoria/deploy/scripts/backup-mongodb.sh >> /var/log/navoria-backup.log 2>&1
```

Die Backups landen in `/opt/navoria/backups/` — 14 Tage Retention.

### Schritt 9: SSL-Auto-Renewal aktivieren

Certbot installiert automatisch einen Systemd-Timer, der 2×/Tag prüft. Das reicht.
Prüfe mit: `systemctl list-timers | grep certbot`

Bei Renewal wird Nginx nicht automatisch neu geladen — deshalb ein deploy-hook:

```bash
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

---

## 🔄 Zukünftige Deployments

Nach Code-Änderungen im Repository:
```bash
cd /opt/navoria
bash deploy/scripts/deploy.sh
```

Das Script macht:
1. `git pull`
2. `docker compose build app`
3. `docker compose up -d app` (rolling restart)
4. Bereinigt alte Images

---

## 🆘 Troubleshooting

**App startet nicht:**
```bash
docker compose logs app --tail 100
```

**MongoDB nicht erreichbar:**
```bash
docker compose exec mongo mongosh --eval "db.serverStatus().ok"
```

**Nginx-Config-Fehler:**
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

**SSL-Cert läuft ab:**
```bash
certbot renew --dry-run
```

**Wildcard funktioniert nicht:**
- DNS prüfen: `dig +short *.navoria.de` — sollte die Server-IP zeigen
- Nginx-Config prüfen: `server_name navoria.de *.navoria.de;`

---

## 📊 Ressourcen-Monitoring

Auf dem Server:
```bash
# Docker-Stats
docker stats --no-stream

# System-Load
htop

# Disk-Usage
df -h /opt /var/lib/docker
```

Bei CX22 (4 GB RAM) sollte Navoria ~800 MB nutzen (App: 500 MB, MongoDB: 200 MB, Nginx: 50 MB, Rest System).
