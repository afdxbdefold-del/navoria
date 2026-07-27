#!/bin/bash
# Navoria MongoDB Backup-Script (via Cronjob täglich um 3:15 Uhr)
#
# Beispiel-Crontab (crontab -e):
#   15 3 * * * /opt/navoria/deploy/scripts/backup-mongodb.sh >> /var/log/navoria-backup.log 2>&1

set -euo pipefail

BACKUP_DIR='/opt/navoria/backups'
DATE=$(date +%Y-%m-%d_%H%M)
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting MongoDB dump"

# Dump aus Docker-Container in lokales Volume
docker exec -i navoria-mongo \
  mongodump --db=navoria_db --archive --gzip > "$BACKUP_DIR/navoria-$DATE.gz"

# Größe prüfen
SIZE=$(du -h "$BACKUP_DIR/navoria-$DATE.gz" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dump complete: $SIZE"

# Alte Backups löschen
find "$BACKUP_DIR" -name 'navoria-*.gz' -type f -mtime +$RETENTION_DAYS -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup finished (retention: $RETENTION_DAYS days)"
