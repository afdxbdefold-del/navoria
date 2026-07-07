#!/bin/bash
# Exportiert die lokale MongoDB als komprimiertes Archiv.
# Ausführung im Emergent-Preview-Container.
set -euo pipefail

DUMP_DIR="/tmp/navoria-dump"
ARCHIVE="/tmp/navoria-dump-$(date +%Y%m%d-%H%M%S).tar.gz"

rm -rf "$DUMP_DIR"
mkdir -p "$DUMP_DIR"

echo "→ Dumping lokale DB nach $DUMP_DIR ..."
mongodump --uri="mongodb://localhost:27017" --db=navoria_db --out="$DUMP_DIR"

echo "→ Erstelle Archiv $ARCHIVE ..."
tar czf "$ARCHIVE" -C /tmp "$(basename $DUMP_DIR)"

SIZE=$(du -h "$ARCHIVE" | cut -f1)
echo "✔ Fertig. Archiv: $ARCHIVE ($SIZE)"
echo ""
echo "Nächster Schritt: Archiv herunterladen (via Emergent Files) und lokal importieren:"
echo "  bash scripts/db-export/import-atlas.sh $(basename $ARCHIVE)"
