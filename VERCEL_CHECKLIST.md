# ✅ Vercel Go-Live Checklist

Quick-Reference vor dem produktiven Umschalten der Domain `navoria.de`.

## Vor dem Deploy

- [ ] MongoDB Atlas EU (Frankfurt) Cluster erstellt und Cluster-URI notiert
- [ ] Atlas Network Access: IP-Range `0.0.0.0/0` freigegeben (oder Vercel Static IPs)
- [ ] Atlas User `navoria-app` mit `readWrite@navoria_db` angelegt
- [ ] Lokale DB dumped: `bash scripts/db-export/export-local.sh`
- [ ] Dump nach Atlas restored: `ATLAS_URI=... bash scripts/db-export/import-atlas.sh dump.tar.gz`
- [ ] Atlas: `db.doctor_places.countDocuments()` matcht Preview-Count
- [ ] Atlas: Indizes aus `DEPLOYMENT.md § Anhang B` angelegt
- [ ] Neuer Admin-Password + Session-Secret generiert (nicht `navoria2025`!)
- [ ] Zufalls-Salt für `ANALYTICS_SALT` generiert (`openssl rand -hex 32`)
- [ ] Google Places API-Key mit Referrer-Restriction (`https://navoria.de/*`)

## Vercel-Setup

- [ ] Git-Repo verbunden
- [ ] Framework Preset: **Next.js**
- [ ] Install Command: `yarn install`
- [ ] Node Version: **20.x**
- [ ] Region: **Frankfurt (fra1)** (aus `vercel.json`)
- [ ] Alle 9 ENV-Vars gesetzt (siehe `.env.production.example`)
- [ ] Erstes Deployment auf Preview-URL erfolgreich

## Smoke-Tests auf Preview-URL

```bash
BASE="https://navoria-xxx.vercel.app"
curl -sf "$BASE/api" && echo "✓ Health"
curl -sf "$BASE/api/mcp" | jq -r .tools_count && echo "✓ MCP"
curl -sf "$BASE/api/search?q=Hausarzt&ort=Berlin&limit=1" | jq -r '.results | length'
curl -sfI "$BASE/sitemap.xml" | head -1
curl -sfI "$BASE/robots.txt" | head -1
```

- [ ] Admin-Login: `POST /api/admin/login` mit neuem Passwort
- [ ] Suche liefert Ergebnisse
- [ ] Praxis-Profil rendert inkl. OG-Bild
- [ ] `/mcp` Doku-Seite lädt
- [ ] Google Places Import (klein): 1 Test-Import via `/admin/sync`

## Domain-Cutover

- [ ] Domain `navoria.de` in Vercel hinzugefügt
- [ ] DNS-Records laut Vercel-Anleitung gesetzt
- [ ] SSL-Zertifikat provisioniert (auto)
- [ ] `NEXT_PUBLIC_BASE_URL=https://navoria.de` gesetzt und redeployed
- [ ] Google Search Console: neue Property für `navoria.de` (falls nicht schon vorhanden)
- [ ] Sitemap in GSC eingereicht: `https://navoria.de/sitemap.xml`
- [ ] Bing Webmaster Tools: Sitemap eingereicht

## Kampagnen-Worker (Sonderthema)

Große Bulk-Imports laufen NICHT auf Vercel Serverless. Optionen:

- [ ] **Option A** – Kampagnen weiter über Emergent-Preview fahren, DB schreibt in Atlas (nur `MONGO_URL` in Preview-`.env` auf Atlas umstellen)
- [ ] **Option B** – Vercel Cron alle 5 Min, verarbeitet je 10 Queries aus `campaigns.queries[]` mit `done:false`
- [ ] **Option C** – Separater Worker auf Railway/Render/Fly.io (24 h/Tag)

Empfehlung für MVP: **Option A** – zero-cost, keine Code-Änderungen.

## Nach dem Cutover

- [ ] Google Search Console: 301/URL-Änderungen prüfen (falls Preview-URLs indexiert waren)
- [ ] AdSense: Domain-Verifikation prüfen (`navoria.de` statt Preview-URL)
- [ ] Analytics-Dashboard `/admin/analytics` zeigt korrekte Daten
- [ ] Alte Emergent-Preview-DB als Backup archivieren (nach 4 Wochen stable)
