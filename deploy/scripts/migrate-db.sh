#!/bin/bash
# Navoria Datenmigration — Von Preview (Emergent) auf Hetzner
#
# Anwendung:
#   Auf Preview-Server:
#     bash migrate-db.sh dump  # erzeugt navoria-dump.gz
#   Anschließend per scp übertragen:
#     scp navoria-dump.gz root@<hetzner-ip>:/opt/navoria/
#   Auf Hetzner-Server:
#     bash migrate-db.sh restore /opt/navoria/navoria-dump.gz

set -euo pipefail

ACTION="${1:-}"
DUMP_FILE="${2:-navoria-dump.gz}"

case "$ACTION" in
  dump)
    echo '→ Creating MongoDB dump'
    # Passe MONGO_URL an falls nicht localhost
    MONGO_URL="${MONGO_URL:-mongodb://localhost:27017}"
    DB_NAME="${DB_NAME:-navoria_db}"
    mongodump --uri="$MONGO_URL" --db="$DB_NAME" --archive="$DUMP_FILE" --gzip
    SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    echo "✅ Dump created: $DUMP_FILE ($SIZE)"
    echo ''
    echo 'Nächster Schritt (auf lokalem Rechner):'
    echo "  scp $DUMP_FILE root@<hetzner-ip>:/opt/navoria/"
    echo "  ssh root@<hetzner-ip> 'cd /opt/navoria && bash deploy/scripts/migrate-db.sh restore /opt/navoria/$DUMP_FILE'"
    ;;
  restore)
    if [ ! -f "$DUMP_FILE" ]; then
      echo "✗ Dump-Datei nicht gefunden: $DUMP_FILE"
      exit 1
    fi
    echo "→ Restoring MongoDB from $DUMP_FILE"
    cd /opt/navoria
    # MongoDB muss laufen
    docker compose -f deploy/docker-compose.yml up -d mongo
    sleep 5
    # Warten bis Mongo healthy ist
    for i in {1..20}; do
      if docker compose -f deploy/docker-compose.yml ps mongo | grep -q '(healthy)'; then break; fi
      echo "  ... warte auf Mongo healthy ($i/20)"
      sleep 3
    done
    # Dump in Container kopieren (robuster als stdin-Redirect)
    docker cp "$DUMP_FILE" navoria-mongo:/tmp/navoria-dump.gz
    docker compose -f deploy/docker-compose.yml exec -T mongo \
      mongorestore --archive=/tmp/navoria-dump.gz --gzip --drop
    docker compose -f deploy/docker-compose.yml exec -T mongo rm -f /tmp/navoria-dump.gz
    echo '✅ Restore complete'
    echo ''
    echo 'Optional: Dump-Datei löschen (enthält Klartext-Daten)'
    echo "  rm $DUMP_FILE"
    ;;
  *)
    echo "Usage: $0 dump|restore [dump-file]"
    exit 1
    ;;
esac
