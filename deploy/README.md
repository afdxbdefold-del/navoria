# Navoria Deployment auf Hetzner CX22 — Schritt-für-Schritt

**Ziel-Setup:**
- Hetzner CX22 (2 vCPU, 4 GB RAM, 40 GB SSD, Ubuntu 24.04)
- Docker Compose: Next.js-App + MongoDB
- Caddy (HOST-nativ) als Reverse-Proxy mit automatischem TLS on-demand
- Tägliches MongoDB-Backup via Cronjob
- **DNS-Cutover erst ganz am Ende** → keine Downtime, keine Rollback-Panik

---

## 🧭 Migrations-Strategie in 3 Phasen

| Phase | Was passiert | Status alt / neu |
|-------|--------------|------------------|
| **A — Aufbau (Schritte 1-7)** | Hetzner-Server bauen, App + DB live, aber nur intern via `curl -H "Host: navoria.de"` testbar | Preview läuft weiter live |
| **B — DNS-Cutover (Schritt 8)** | Bei IONOS A-Records auf Hetzner-IP umlegen, Wildcard anlegen | Traffic wandert innerhalb 5-60 Min |
| **C — Nachziehen (Schritt 9-10)** | Caddy startet & holt automatisch SSL-Certs, Backups aktivieren, Preview abschalten | Neue Prod stabil |

---

## 📋 Voraussetzungen (vom User bereits vorhanden)

- ✅ Hetzner CX22 Server läuft, Ubuntu 24.04 LTS, öffentliche IPv4
- ✅ SSH-Zugang als `root` (oder sudo-User)
- ✅ Zugang zur IONOS DNS-Konsole (wird erst in Phase B gebraucht)
- ✅ Aktuelle `.env` aus Preview kennen (Werte werden in Schritt 3 gebraucht)

---

# 🚀 PHASE A — Aufbau (ohne DNS-Änderung)

## Schritt 1: Code auf den Server bringen

**Option 1 — via Github (empfohlen):**
Wenn du in Emergent den Button „Save to Github" verwendet hast, hast du ein Repo (z. B. `github.com/<user>/navoria`).

```bash
# Auf dem Hetzner-Server als root
apt-get update && apt-get install -y git
mkdir -p /opt && cd /opt
git clone https://github.com/<dein-user>/navoria.git navoria
cd /opt/navoria
```

**Option 2 — via rsync (falls kein Github-Repo):**
Vom lokalen Rechner aus, in dem Ordner in dem du das Emergent-Preview ausgecheckt hast:

```bash
# Lokal, im Repo-Root
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  --exclude '.emergent' --exclude 'memory' \
  ./ root@<HETZNER-IP>:/opt/navoria/
```

## Schritt 2: Server initialisieren (Docker, Caddy, Firewall)

```bash
# Auf dem Hetzner-Server, als root
cd /opt/navoria
bash deploy/scripts/server-init.sh
```

Das Script installiert:
- Docker Engine + Compose Plugin
- Caddy Webserver
- UFW-Firewall (nur SSH, 80, 443 offen)
- Fail2Ban (SSH-Bruteforce-Schutz)
- unattended-upgrades

**Dauer:** ca. 2-3 Minuten.

**Verifizieren:**
```bash
docker --version                # muss "Docker version 27.x" o.ä. zeigen
docker compose version          # "Docker Compose version v2.x"
caddy version                   # "v2.x.x"
ufw status                      # 22, 80, 443 → ALLOW
```

## Schritt 3: Environment-Variablen setzen

```bash
cp /opt/navoria/deploy/.env.example /opt/navoria/deploy/.env
nano /opt/navoria/deploy/.env
```

Trage ein:
| Variable | Wert |
|----------|------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_BASE_URL` | `https://navoria.de` |
| `MONGO_URL` | `mongodb://mongo:27017` *(intern im Docker-Netz)* |
| `DB_NAME` | `navoria_db` |
| `ADMIN_EMAIL` | `admin@navoria.de` |
| `ADMIN_PASSWORD` | dein starkes Passwort |
| `GOOGLE_PLACES_API_KEY` | aus alter `.env` übernehmen |
| `OUTSCRAPER_API_KEY` | aus alter `.env` übernehmen |
| `EMERGENT_LLM_KEY` | falls verwendet |

**⚠️ Passwörter niemals ins Git committen.** `deploy/.env` ist bereits in `.gitignore`.

## Schritt 4: App bauen & starten

```bash
cd /opt/navoria
docker compose -f deploy/docker-compose.yml build
docker compose -f deploy/docker-compose.yml up -d
```

**Erster Build dauert 3-5 Min** (Yarn install + Next.js build).

**Status prüfen:**
```bash
docker compose -f deploy/docker-compose.yml ps
# Beide Container müssen "running (healthy)" zeigen — Healthcheck braucht ~60 Sek nach Start.

docker compose -f deploy/docker-compose.yml logs app --tail 50
# Muss "Ready in ...ms" und "Local: http://0.0.0.0:3000" zeigen.
```

**Health-Check:**
```bash
curl -s http://127.0.0.1:3000/api/health
# Muss: {"ok":true,"db":"up","latency_ms":<zahl>,"ts":"..."}
```

Wenn `db: "down"` erscheint → MongoDB noch nicht bereit. 30 Sek warten, nochmal probieren.

## Schritt 5: Datenbank vom Preview migrieren

**5a) Dump auf dem Preview-Server erstellen**

Im Emergent-Preview, Emergent-Chat:
> „Bitte erstelle einen mongodump von `navoria_db` als `/app/navoria-dump.gz`"

Der Agent führt aus:
```bash
mongodump --uri="$MONGO_URL" --db=navoria_db --archive=/app/navoria-dump.gz --gzip
```

Anschließend lädst du dir die Datei über den Emergent-Datei-Download aus `/app/navoria-dump.gz` herunter.

**5b) Dump auf Hetzner übertragen (lokal)**

```bash
# Auf deinem lokalen Rechner
scp navoria-dump.gz root@<HETZNER-IP>:/opt/navoria/
```

**5c) Restore auf Hetzner**

```bash
# Auf dem Hetzner-Server
cd /opt/navoria
bash deploy/scripts/migrate-db.sh restore /opt/navoria/navoria-dump.gz
```

Das Script kopiert den Dump ins Mongo-Container-Volume, führt `mongorestore --drop` aus und räumt auf.

**Verifizieren:**
```bash
docker exec -it navoria-mongo mongosh --quiet --eval \
  "db.getSiblingDB('navoria_db').doctor_places.countDocuments()"
# Muss die Anzahl der Praxen aus Preview zeigen (>0)

curl -s http://127.0.0.1:3000/api/health | jq
# Muss weiterhin ok:true zeigen
```

**Dump löschen (enthält Klartext-Daten):**
```bash
rm /opt/navoria/navoria-dump.gz
```

## Schritt 6: App-Test via Host-Header (OHNE DNS!)

Weil DNS noch auf Preview zeigt, testen wir die neue Prod über den `Host`-Header. Damit trickst du Next.js in den Produktions-Rendermodus.

```bash
# Root-Domain
curl -sI -H "Host: navoria.de" http://127.0.0.1:3000/
# Erwartung: HTTP/1.1 200 OK

# Praxis-Detailseite (echten Slug aus DB einsetzen!)
curl -sI -H "Host: navoria.de" http://127.0.0.1:3000/aerzte
# HTTP/1.1 200

# Praxis-Subdomain (Homepage-Modus, echten homepage_slug einsetzen!)
curl -sI -H "Host: dr-mustermann.navoria.de" http://127.0.0.1:3000/
# HTTP/1.1 200 (falls Homepage-Mode aktiv) oder 301 auf /praxis/... (falls nicht)

# Admin-Login testen
curl -sI -H "Host: navoria.de" http://127.0.0.1:3000/admin
# HTTP/1.1 200

# TLS-Check-Endpoint (den Caddy später abfragen wird)
curl -s "http://127.0.0.1:3000/api/tls-check?domain=navoria.de"
# → ok
curl -sI "http://127.0.0.1:3000/api/tls-check?domain=admin.navoria.de"
# → HTTP/1.1 403 (reserviert, korrekt)
```

Wenn eine dieser Prüfungen fehlschlägt → **STOP**, Logs prüfen mit `docker compose -f deploy/docker-compose.yml logs app`. Nicht weiter zu Schritt 7.

## Schritt 7: Caddyfile installieren (aber NICHT starten)

Caddyfile ins System-Verzeichnis kopieren, aber Caddy noch NICHT starten — der würde beim Start versuchen, Certs zu holen, was aber ohne DNS scheitern und Let's Encrypt Rate-Limits belasten würde.

```bash
cp /opt/navoria/deploy/Caddyfile /etc/caddy/Caddyfile

# E-Mail für Let's Encrypt Renewal-Warnings prüfen
nano /etc/caddy/Caddyfile
# Zeile "email admin@navoria.de" auf deine echte Adresse setzen

# Syntax-Check (validiert die Config OHNE zu starten)
caddy validate --config /etc/caddy/Caddyfile
# Muss: "Valid configuration"
```

**Caddy-Autostart deaktivieren** (bis DNS steht):
```bash
systemctl stop caddy 2>/dev/null || true
systemctl disable caddy
```

**Zwischenstand:**
- ✅ Docker-Stack läuft, App healthy, DB restored
- ✅ Alle App-Endpoints unter `curl -H "Host:"` erreichbar
- ✅ Caddyfile validiert, aber Caddy schläft
- ⏸ Preview läuft weiter, kein Traffic betroffen

---

# 🎯 PHASE B — DNS-Cutover bei IONOS

## Schritt 8: DNS umstellen

**8a) TTL-Vorbereitung (1 Stunde vor Cutover — empfohlen):**

Bei IONOS DNS-Konsole → für `navoria.de` und `www.navoria.de` A-Records → **TTL auf 300 Sek (5 Min)** setzen. Bleibt so bis nach Cutover, kann später wieder auf 3600 erhöht werden.

Dann eine Stunde warten, damit alte TTL-Caches weltweit ablaufen.

**8b) A-Records umlegen:**

Bei IONOS DNS-Konsole, folgende drei Records setzen/anpassen:

| Host | Typ | Wert | TTL |
|------|-----|------|-----|
| `@` (navoria.de) | A | `<HETZNER-IP>` | 300 |
| `www` | A | `<HETZNER-IP>` | 300 |
| `*` (Wildcard) | A | `<HETZNER-IP>` | 300 |

Der Wildcard-Record `*.navoria.de` ist neu und wichtig für Praxis-Subdomains.

**8c) DNS-Propagation prüfen:**
```bash
# Kann 5-60 Min dauern. Wiederhole bis alle 3 die Hetzner-IP zeigen:
dig +short navoria.de
dig +short www.navoria.de
dig +short irgendwas.navoria.de   # Wildcard-Test

# Von anderen DNS-Resolvern gegenprüfen:
dig +short navoria.de @8.8.8.8
dig +short navoria.de @1.1.1.1
```

**Erst weiter wenn alle drei die Hetzner-IP zeigen.**

---

# ✅ PHASE C — Nachziehen

## Schritt 9: Caddy starten (holt automatisch SSL)

```bash
# Auf dem Hetzner-Server
systemctl enable caddy
systemctl start caddy
sleep 5

# Live-Log während Caddy die ersten Certs holt
journalctl -u caddy -f
```

Beim ersten HTTPS-Request auf `navoria.de` holt Caddy via HTTP-01-Challenge (Port 80) automatisch ein Let's Encrypt Cert. Dauert 3-5 Sek beim allerersten Mal, danach gecacht.

**Ctrl+C** um `journalctl` zu verlassen.

**Endgültige Verifikation:**
```bash
# Root
curl -sI https://navoria.de/ | head -5
# HTTP/2 200 mit gültigem Let's Encrypt Cert

# www
curl -sI https://www.navoria.de/ | head -5

# Praxis-Subdomain (echten Slug aus DB einsetzen!)
curl -sI https://dr-mustermann.navoria.de/ | head -5

# Health
curl -s https://navoria.de/api/health | jq

# SSL-Details
echo | openssl s_client -servername navoria.de -connect navoria.de:443 2>/dev/null | \
  openssl x509 -noout -issuer -subject -dates
# Muss "issuer=... Let's Encrypt" und gültiges Ablaufdatum zeigen
```

**Im Browser** öffne:
- `https://navoria.de/` → grünes Schloss
- `https://navoria.de/admin` → Admin-Login → Passwort aus `.env`
- Eine gültige Praxis-Subdomain

## Schritt 10: Backups aktivieren

```bash
crontab -e
```

Diese Zeile hinzufügen:
```
15 3 * * * /opt/navoria/deploy/scripts/backup-mongodb.sh >> /var/log/navoria-backup.log 2>&1
```

Backup läuft jede Nacht um 3:15, landet in `/opt/navoria/backups/`, Retention 14 Tage.

**Manueller Test:**
```bash
bash /opt/navoria/deploy/scripts/backup-mongodb.sh
ls -lh /opt/navoria/backups/
```

## Schritt 11: Emergent-Preview abschalten

Nach **mindestens 24 h stabilem Betrieb** auf Hetzner:
- Emergent-Preview → Deployment stoppen oder in einen Read-Only-Modus versetzen
- Alten MongoDB-Snapshot als Fallback lokal aufbewahren

---

# 🔄 Zukünftige Deployments

Nach jedem Code-Update im Github-Repo:
```bash
cd /opt/navoria
bash deploy/scripts/deploy.sh
```

Das Script: `git pull` → `docker compose build` → rolling restart → cleanup.
Caddy muss **nicht** neu gestartet werden.

---

# 🔒 On-Demand-TLS — So funktioniert es

Beim ersten HTTPS-Request auf eine neue Subdomain (z. B. `neu-praxis.navoria.de`):

1. User → HTTPS-Request an `neu-praxis.navoria.de`
2. Caddy: „Kein Cert für diese Domain — fragen bei Navoria: `GET http://127.0.0.1:3000/api/tls-check?domain=neu-praxis.navoria.de`"
3. Endpoint prüft:
   - Endet auf `.navoria.de`? ✅
   - Reservierter Slug (www, admin, api…)? ❌
   - Slug-Format ok (3-80 Zeichen, a-z0-9-)? ✅
   - → HTTP 200
4. Caddy: „OK, hole via HTTP-01 ein Let's Encrypt Cert" (~3-5 Sek)
5. Nutzer bekommt Response mit gültigem SSL
6. Cache liegt in `/var/lib/caddy/.local/share/caddy/certificates/`
7. Auto-Renewal ~30 Tage vor Ablauf

**Strengere Absicherung (optional):**
Bei Missbrauch (jemand crawlt `aaa.navoria.de`, `aab.navoria.de` …) kannst du in `/app/app/api/tls-check/route.js` den kommentierten DB-Lookup-Block (Zeilen ~62-70) aktivieren, damit nur Certs für tatsächlich in der DB existierende `homepage_slug`-Praxen ausgestellt werden.

---

# 🆘 Troubleshooting

**App startet nicht:**
```bash
docker compose -f /opt/navoria/deploy/docker-compose.yml logs app --tail 100
```

**MongoDB unhealthy:**
```bash
docker compose -f /opt/navoria/deploy/docker-compose.yml logs mongo --tail 100
docker exec -it navoria-mongo mongosh --eval "db.serverStatus().ok"
```

**Caddy holt keine Certs:**
```bash
# Zeigt Caddy-Fehler in Echtzeit
journalctl -u caddy -f

# tls-check direkt testen
curl -s "http://127.0.0.1:3000/api/tls-check?domain=deine-testsubdomain.navoria.de"
# → sollte "ok" (200) zurückgeben

# DNS-Check
dig +short deine-testsubdomain.navoria.de
# → muss Hetzner-IP zeigen

# Let's Encrypt Rate-Limit erreicht?
ls /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/
```

**Rollback zu Preview (falls kritischer Fehler):**
```
IONOS DNS: A-Records wieder auf alte Preview-IP zurücksetzen.
TTL 300 → Umschaltung in 5 Min weltweit.
```

**Container-Neustart:**
```bash
cd /opt/navoria
docker compose -f deploy/docker-compose.yml restart app
docker compose -f deploy/docker-compose.yml restart mongo
```

**Kompletter Neubau (worst case):**
```bash
cd /opt/navoria
docker compose -f deploy/docker-compose.yml down
docker compose -f deploy/docker-compose.yml build --no-cache
docker compose -f deploy/docker-compose.yml up -d
```

---

# 📊 Monitoring

```bash
docker stats --no-stream                              # CPU/RAM je Container
htop                                                  # System-Last
df -h /opt /var/lib/docker /var/lib/caddy             # Disk
ls /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/  # aktive SSL-Certs
tail -f /var/log/caddy/navoria.log                    # Access-Log
```

Bei CX22 (4 GB RAM) sollte Navoria ~800 MB nutzen (App: ~500 MB, MongoDB: ~200 MB, Caddy: ~30 MB).

---

# 📝 Zusammenfassung Phase A → B → C

```
Phase A (kein Traffic-Impact):
  1. Code auf Server                → git clone / rsync
  2. Server-Init                    → bash server-init.sh
  3. .env setzen                    → cp .env.example → nano
  4. Docker Compose up              → docker compose up -d
  5. DB restore                     → bash migrate-db.sh restore
  6. Test via curl -H "Host:"       → HTTP 200
  7. Caddyfile validieren           → caddy validate (KEIN start!)

Phase B (DNS-Cutover):
  8. IONOS: A-Records + Wildcard  → auf Hetzner-IP, TTL 300

Phase C (finalisieren):
  9. systemctl start caddy          → Certs on-demand
  10. Backup-Cron einrichten        → crontab
  11. Preview abschalten            → nach 24 h stabil
```

**Sicherer, verwerfbarer Zustand:** Bis Phase B (Schritt 8) ist alles rückgängig machbar durch nichts tun. Erst der DNS-Switch macht Hetzner „live".
