#!/bin/bash
# Importiert das Dump-Archiv in MongoDB Atlas.
# Ausführung LOKAL (nicht im Preview-Container – dort fehlt der Atlas-Zugriff).
set -euo pipefail

if [ -z "${ATLAS_URI:-}" ]; then
  echo "✖ Bitte ATLAS_URI setzen:"
  echo "  export ATLAS_URI='mongodb+srv://user:pass@cluster0.xxx.mongodb.net/'"
  exit 1
fi

ARCHIVE="${1:-}"
if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
  echo "✖ Nutzung: $0 <navoria-dump-YYYYMMDD-HHMMSS.tar.gz>"
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "→ Entpacke $ARCHIVE ..."
tar xzf "$ARCHIVE" -C "$WORK_DIR"

DUMP_PATH=$(find "$WORK_DIR" -maxdepth 2 -type d -name navoria_db | head -1)
if [ -z "$DUMP_PATH" ]; then
  echo "✖ Kein navoria_db-Verzeichnis im Archiv gefunden."
  exit 1
fi

echo "→ Restore nach Atlas ..."
mongorestore --uri="$ATLAS_URI" --nsInclude="navoria_db.*" "$(dirname $DUMP_PATH)"

echo "✔ Import fertig."
echo ""
echo "Verifikation: mongosh \"$ATLAS_URI/navoria_db\" --eval 'db.doctor_places.countDocuments()'"
