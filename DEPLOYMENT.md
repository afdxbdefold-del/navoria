# Navoria · Vercel Deployment Guide

Dieses Dokument beschreibt die vollständige Migration von der Emergent-Preview-Umgebung zu **Vercel + MongoDB Atlas EU**.

> **Wichtiger Hinweis vorab:** Der Bulk-Import-Worker (`/admin/kampagnen`) läuft **stundenlang** im Hintergrund. Vercel Serverless Functions haben ein Timeout von max. 60 Sekunden (Pro-Plan) bzw. 900 Sekunden (Enterprise). Große Kampagnen (Rest-DE = 5000+ Queries × 4s = 5+ Stunden) **funktionieren auf Vercel nicht**. Empfehlung: Kampagnen weiterhin über die Emergent-Preview-Umgebung fahren, oder einen separaten Worker (Railway / Render / Fly.io) für Kampagnen-Jobs aufsetzen. Die restliche App (Suche, Profile, Admin-CRUD, MCP, Analytics) funktioniert vollständig auf Vercel.

---

## 1. MongoDB Atlas EU aufsetzen (10 Min)

1. Account: <https://www.mongodb.com/cloud/atlas/register>
2. **Create Cluster**:
   - Tier: **M0 Free** (500 MB) oder **M10** ab ~57 $/Monat (10 GB, dedicated) für Produktion
   - **Region: Frankfurt (eu-central-1)** – wichtig für DSGVO & Latenz zu Vercel FRA1
   - Provider: AWS
3. **Database Access**: Neuen User anlegen (z. B. `navoria-app`) mit Passwort. Rolle: `readWrite@navoria_db`.
4. **Network Access**: Für Vercel entweder
   - **Allow Access from Anywhere** (`0.0.0.0/0`) – bequem, aber weniger sicher, ODER
   - **Vercel Static Egress IPs** (nur Pro/Enterprise, siehe <https://vercel.com/docs/edge-network/regions#pro-and-enterprise-only>)
5. **Connection String** kopieren:
   ```
   mongodb+srv://navoria-app:<PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Navoria
   ```

## 2. Daten migrieren (Preview → Atlas)

Vom Emergent-Preview-Container aus:

```bash
# Dump lokale DB (im Preview-Container)
mkdir -p /tmp/navoria-dump
mongodump --uri="mongodb://localhost:27017" --db=navoria_db --out=/tmp/navoria-dump

# Archiv erstellen und herunterladen
tar czf /tmp/navoria-dump.tar.gz -C /tmp navoria-dump
# → dann per Emergent File-Download / scp auf lokalen Rechner ziehen

# LOKAL (nicht im Preview-Container) → in Atlas restoren
tar xzf navoria-dump.tar.gz
mongorestore --uri="mongodb+srv://navoria-app:<PASSWORD>@cluster0.xxxxx.mongodb.net/" \
  --nsInclude="navoria_db.*" navoria-dump/
```

**Verifikation** (mit `mongosh`):
```javascript
use navoria_db
db.doctor_places.countDocuments()   // sollte ≈ Live-Zahl matchen
db.campaigns.countDocuments()
db.cities.countDocuments()
```

## 3. Vercel-Projekt anlegen

1. <https://vercel.com/new> → **Import Git Repository**
2. Framework: **Next.js** (auto-detected)
3. Root Directory: `.` (Repo-Root)
4. Build Command: `next build` (default)
5. Output Directory: `.next` (default)
6. Install Command: `yarn install` (WICHTIG: **nicht npm** – package-lock.json fehlt)
7. Node.js Version: **20.x** (Vercel Default 2025)

### Environment Variables in Vercel setzen

Project → Settings → Environment Variables. Aus `.env.production.example` übernehmen:

| Variable | Wert | Env |
|---|---|---|
| `MONGO_URL` | Atlas-Connection-String | Production, Preview |
| `DB_NAME` | `navoria_db` | Production, Preview |
| `NEXT_PUBLIC_BASE_URL` | `https://navoria.de` (Prod) / `$VERCEL_URL` (Preview) | Production / Preview |
| `GOOGLE_PLACES_API_KEY` | Neuer Key mit Referrer-Restriction | Production, Preview |
| `ADMIN_EMAIL` | Prod-E-Mail | Production, Preview |
| `ADMIN_PASSWORD` | **Starkes** Passwort (nicht `navoria2025`!) | Production, Preview |
| `ADMIN_SESSION_SECRET` | Zufällig, 64+ Zeichen (`openssl rand -hex 32`) | Production, Preview |
| `ANALYTICS_SALT` | Zufällig, 32+ Zeichen | Production, Preview |
| `CORS_ORIGINS` | `https://navoria.de` | Production |

> **Tipp:** Für Preview-Deployments einen zweiten, weniger sensiblen Admin-Zugang setzen.

## 4. Google Places API absichern

1. Google Cloud Console → APIs & Services → Credentials
2. Bei bestehendem Key: **Application restrictions** → **HTTP referrers**
   - `https://navoria.de/*`
   - `https://*.vercel.app/*` (für Preview-URLs)
3. **API restrictions** → nur `Places API (New)` erlauben

## 5. Erstes Deployment

1. Vercel auf Deploy klicken oder Push auf `main`
2. Build-Logs prüfen – `next build` sollte durchlaufen
3. Health-Checks:
   ```bash
   curl -i https://navoria.de/api
   curl -i https://navoria.de/api/mcp
   curl -i https://navoria.de/sitemap.xml
   curl -i https://navoria.de/.well-known/mcp.json
   ```

## 6. Domain zuweisen

1. Vercel → Project → Settings → Domains → `navoria.de` + `www.navoria.de` hinzufügen
2. DNS A/CNAME laut Vercel-Anleitung setzen (Ionos/Hetzner/etc.)
3. HTTPS-Zertifikat wird automatisch von Vercel provisioniert
4. `NEXT_PUBLIC_BASE_URL=https://navoria.de` produktiv setzen und redeployen

## 7. Post-Deployment Checks

- [ ] `/` lädt & Suche funktioniert
- [ ] `/admin` Login klappt mit neuem Passwort
- [ ] `/admin/stats` zeigt korrekten doctor_count (matcht Atlas-Dump)
- [ ] `/api/search?q=Hausarzt&ort=Berlin` liefert Ergebnisse
- [ ] `/api/mcp` GET liefert Server-Manifest
- [ ] `/sitemap.xml` erreichbar
- [ ] `/praxis/berlin/xxx` Profilseite lädt inkl. OG-Bild
- [ ] Google Search Console re-verifizieren (evtl. `google.....html` als static file redeployen)
- [ ] robots.txt zeigt Prod-Domain

## 8. Bekannte Einschränkungen auf Vercel

### ❌ Nicht auf Vercel möglich
- **Kampagnen-Worker** > 60 s Laufzeit → Timeout
- **File-Uploads** > 4.5 MB (Vercel Edge Body Limit)
- **Background Jobs** ohne externen Scheduler

### ✅ Workarounds
- **Kampagnen** über Vercel Cron in kleinen Häppchen (max ~15 Queries pro Cron-Run), oder externen Worker
- **OpenGraph-Bilder** cachen (Cache-Control 24h)
- **Sitemap-Chunks** ISR (`revalidate: 3600`)

## 9. Rollback-Plan

Emergent-Preview bleibt live während der Migration. Falls Vercel-Deployment scheitert:
1. DNS auf Emergent zurückzeigen (falls DNS bereits umgestellt)
2. Emergent-DB ist unangetastet – Atlas-Dump ist One-Way (keine Rückschreibung nötig)

---

## Anhang A: Zufallswerte generieren

```bash
openssl rand -hex 32       # ADMIN_SESSION_SECRET, ANALYTICS_SALT
openssl rand -base64 24    # Admin-Passwort
```

## Anhang B: MongoDB-Indizes für Prod

Nach der Migration sicherstellen, dass die Performance-Indizes existieren:

```javascript
use navoria_db
db.doctor_places.createIndex({ google_place_id: 1 }, { unique: true, sparse: true })
db.doctor_places.createIndex({ city_slug: 1, slug: 1 })
db.doctor_places.createIndex({ city_slug: 1, is_active: 1, rating: -1 })
db.doctor_places.createIndex({ specialty_guess: 1, is_active: 1 })
db.doctor_places.createIndex({ state: 1, is_active: 1 })
db.doctor_places.createIndex({ district: 1, city_slug: 1, is_active: 1 })
db.doctor_places.createIndex({ postal_code: 1 })
db.doctor_places.createIndex({ name: "text", specialty_guess: "text", formatted_address: "text" }, { default_language: "german" })
db.page_views.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })  // 90 Tage TTL
db.claim_requests.createIndex({ status: 1, created_at: -1 })
db.cities.createIndex({ slug: 1 }, { unique: true })
db.campaigns.createIndex({ created_at: -1 })
```
