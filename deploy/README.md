# Navoria Deployment auf Hetzner (Docker Compose + Caddy)

**Ziel-Setup:**
- Hetzner CX22 (2 vCPU, 4 GB RAM, 40 GB SSD, Ubuntu 24.04)
- Docker Compose für Next.js-App + MongoDB
- **Caddy als Reverse-Proxy** — automatisches TLS on-demand für ALLE Praxis-Subdomains
- Tägliches MongoDB-Backup (Cronjob)

## Warum Caddy statt Nginx?

- ✅ **Kein Wildcard-Cert nötig** — Caddy holt für JEDE aufgerufene Subdomain ihr eigenes Cert
- ✅ **Keine DNS-API-Keys nötig** — HTTP-01-Challenge auf Port 80
- ✅ **Kein SSL-Renewal-Setup** — Caddy erneuert alle Certs automatisch im Hintergrund
- ✅ **10 Zeilen Config** statt 80 Zeilen Nginx
- ✅ HTTP/3 (QUIC) out of the box

## 📋 Voraussetzungen

1. **Hetzner CX22 Server** — Ubuntu 24.04 LTS, öffentliche IPv4
2. **SSH-Zugang** als root oder sudo-User
3. **DNS-Records bei IONOS** (oder wo dein DNS läuft):
   - `A navoria.de` → Server-IP
   - `A *.navoria.de` → Server-IP (Wildcard-DNS!)
   - `A www.navoria.de` → Server-IP (falls www.navoria.de genutzt wird)
   - TTL: 300 Sekunden empfohlen

**Wichtig:** DNS muss stimmen BEVOR du Caddy startest — sonst kann Caddy keine ACME-Challenge lösen.

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

# Server-Init-Script ausführen (Docker, Caddy, Firewall, Fail2Ban)
bash deploy/scripts/server-init.sh
```

Installiert Docker Engine + Compose, Caddy, UFW-Firewall (nur SSH/80/443 offen), Fail2Ban, unattended-upgrades.

### Schritt 2: Environment-Variablen setzen

```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Trage ein:
- `MONGO_URL=mongodb://mongo:27017`
- `DB_NAME=navoria_db`
- `ADMIN_PASSWORD=<sicheres-passwort>`
- `NEXT_PUBLIC_BASE_URL=https://navoria.de`
- `OUTSCRAPER_API_KEY=...`
- `GOOGLE_PLACES_API_KEY=...`
- (weitere Keys aus deiner aktuellen `/app/.env`)

### Schritt 3: Caddyfile aktivieren

```bash
cp deploy/Caddyfile /etc/caddy/Caddyfile

# E-Mail-Adresse anpassen (für Let's Encrypt Renewal-Warnings)
nano /etc/caddy/Caddyfile
# Zeile 'email admin@navoria.de' auf deine Adresse setzen

# Caddy neu laden (validiert automatisch die Config)
systemctl restart caddy
systemctl status caddy    # sollte 'active (running)' zeigen
```

### Schritt 4: Datenbank-Migration (Preview → Prod)

**Auf dem aktuellen Preview-Server (Emergent):**
```bash
mongodump --uri="mongodb://localhost:27017" --db=navoria_db --archive=navoria-dump.gz --gzip
```

**Übertragen:**
```bash
scp navoria-dump.gz root@<hetzner-ip>:/opt/navoria/
```

**Auf dem Hetzner-Server:**
```bash
cd /opt/navoria
docker compose -f deploy/docker-compose.yml up -d mongo   # MongoDB starten
docker compose -f deploy/docker-compose.yml exec -T mongo mongorestore --archive --gzip --drop < navoria-dump.gz
rm navoria-dump.gz   # aus Sicherheitsgründen löschen
```

### Schritt 5: App bauen und starten

```bash
cd /opt/navoria
docker compose -f deploy/docker-compose.yml build
docker compose -f deploy/docker-compose.yml up -d
docker compose -f deploy/docker-compose.yml logs -f app
```

App läuft auf `localhost:3000`. Caddy reverse-proxied bereits `navoria.de` + `*.navoria.de` dorthin.

### Schritt 6: Verifizieren

```bash
# Root-Domain (erster Cert-Aquise 3-5 Sek)
curl -sI https://navoria.de/ | head -5

# Wildcard-Subdomain (erster Aufruf holt eigenes Cert)
curl -sI https://jaroslaw-raczynski.navoria.de/ | head -5

# Health-Check
curl -s https://navoria.de/api/health | jq
```

Alle drei sollten `HTTP/2 200` mit gültigem SSL-Cert liefern.

### Schritt 7: Automatische Backups aktivieren

```bash
# Cronjob installieren (täglich 3:15 Uhr)
crontab -e
# Diese Zeile hinzufügen:
15 3 * * * /opt/navoria/deploy/scripts/backup-mongodb.sh >> /var/log/navoria-backup.log 2>&1
```

Backups landen in `/opt/navoria/backups/` — 14 Tage Retention.

---

## 🔄 Zukünftige Deployments

Nach Code-Änderungen im Repository:
```bash
cd /opt/navoria
bash deploy/scripts/deploy.sh
```

Das Script: git pull → docker compose build → rolling restart → cleanup.

**Wichtig:** Caddy muss dabei NICHT neu gestartet werden — es proxy'd weiterhin transparent.

---

## 🔒 On-Demand-TLS: So funktioniert es

Beim ersten Aufruf einer neuen Subdomain (z. B. `neu-praxis.navoria.de`):

1. User → HTTPS-Request an `neu-praxis.navoria.de`
2. Caddy: "Ich habe kein Cert für diese Domain — fragen wir Navoria: `GET /api/tls-check?domain=neu-praxis.navoria.de`"
3. Unser Endpoint (`app/api/tls-check/route.js`) prüft:
   - Endet auf `.navoria.de`? ✅
   - Reservierter Slug (www, admin, api...)? ❌
   - Slug-Format ok (a-z, 0-9, 3-80 Zeichen)? ✅
   - → HTTP 200 zurück
4. Caddy: "OK, ich hole via HTTP-01 ein Let's-Encrypt-Cert" (dauert ~3-5 Sek)
5. Nutzer bekommt Response mit gültigem SSL (kann etwas langsamer sein beim allerersten Mal)
6. Ab jetzt gecacht in `/var/lib/caddy/.local/share/caddy/certificates/`
7. Nach 60 Tagen: Auto-Renewal im Hintergrund

**Rate-Limit-Schutz:**
- Caddy holt Certs im Burst von max 10 pro 5 Min
- Reservierte Subdomains bekommen KEIN Cert (verhindert Missbrauch)
- Zu kurze oder ungültige Slugs → 403 vom `tls-check`

**Wenn du strengere Absicherung willst** (nur Certs für tatsächlich in DB existierende Praxen):
Öffne `/app/app/api/tls-check/route.js` und aktiviere den DB-Lookup-Block (steht kommentiert drin, Zeilen 62-70).

---

## 🆘 Troubleshooting

**App startet nicht:**
```bash
docker compose -f deploy/docker-compose.yml logs app --tail 100
```

**MongoDB nicht erreichbar:**
```bash
docker compose -f deploy/docker-compose.yml exec mongo mongosh --eval "db.serverStatus().ok"
```

**Caddy-Fehler:**
```bash
systemctl status caddy
journalctl -u caddy -n 100
tail -f /var/log/caddy/navoria.log
```

**Cert wird nicht ausgestellt:**
- DNS prüfen: `dig +short neu-praxis.navoria.de` (sollte Server-IP zeigen)
- Test tls-check: `curl -s "http://localhost:3000/api/tls-check?domain=neu-praxis.navoria.de"` sollte 200 zurückgeben
- Caddy-Logs: `journalctl -u caddy -f`
- Rate-Limit erreicht? `ls -la /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/`

**Wildcard-DNS funktioniert nicht:**
```bash
dig +short random123.navoria.de
# Muss die Server-IP zeigen. Wenn leer → DNS nicht korrekt.
```

---

## 📊 Ressourcen-Monitoring

```bash
docker stats --no-stream                              # Docker container
htop                                                  # System load
df -h /opt /var/lib/docker /var/lib/caddy             # Disk usage
ls /var/lib/caddy/.local/share/caddy/certificates/    # aktive SSL-Certs
```

Bei CX22 (4 GB RAM) sollte Navoria ~800 MB nutzen (App: 500 MB, MongoDB: 200 MB, Caddy: 30 MB).
