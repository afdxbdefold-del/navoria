# DB Export / Import Helper

Einfache Skripte für die Migration lokale MongoDB → MongoDB Atlas.

## Vom Emergent-Preview-Container aus

```bash
bash /app/scripts/db-export/export-local.sh
# → erzeugt /tmp/navoria-dump.tar.gz
```

## Lokal (nach Download des Archivs)

```bash
export ATLAS_URI="mongodb+srv://user:pass@cluster0.xxx.mongodb.net/"
bash scripts/db-export/import-atlas.sh /path/to/navoria-dump.tar.gz
```
