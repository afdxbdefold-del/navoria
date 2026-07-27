#!/bin/bash
# Navoria Deploy-Script (auf Hetzner-Server)
# Zieht neuesten Code, baut Image, rolling-restart

set -euo pipefail
cd "$(dirname "$0")/../.."  # /opt/navoria

echo '→ Pull latest code'
git fetch --all --prune
git reset --hard origin/main   # anpassen falls anderer Branch

echo '→ Build App image'
docker compose -f deploy/docker-compose.yml build app

echo '→ Rolling restart App'
docker compose -f deploy/docker-compose.yml up -d app

echo '→ Cleanup old images'
docker image prune -f

echo '→ Warten auf Healthcheck'
for i in {1..30}; do
  if docker compose -f deploy/docker-compose.yml ps app | grep -q '(healthy)'; then
    echo '✅ App is healthy'
    break
  fi
  sleep 2
done

echo ''
echo '✅ Deploy complete'
docker compose -f deploy/docker-compose.yml ps
