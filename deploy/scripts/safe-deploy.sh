#!/usr/bin/env bash
# Navoria VPS Deploy-Helper — löst OOM-Abstürze beim Docker-Build.
#
# Usage (auf dem VPS ausführen):
#   cd /opt/navoria/deploy
#   bash scripts/safe-deploy.sh
#
# Was das Script macht:
#   1. Speicher-Diagnose (RAM + Swap)
#   2. Falls Swap < 4 GB: legt einen 4 GB Swap-File an (permanent)
#   3. Stoppt temporär den laufenden app-Container (falls vorhanden), damit der Build max RAM bekommt
#   4. Führt den Build sequentiell mit BuildKit aus (mit Cache)
#   5. Startet den Stack wieder hoch und zeigt Logs
#
# Idempotent — kann beliebig oft ausgeführt werden.

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { printf "${BOLD}==>${NC} %s\n" "$*"; }
ok()  { printf "${GREEN}✓${NC} %s\n" "$*"; }
warn(){ printf "${YELLOW}⚠${NC} %s\n" "$*"; }
err() { printf "${RED}✗${NC} %s\n" "$*" >&2; }

# ----- 1) Diagnose ---------------------------------------------------------
log "System-Ressourcen prüfen"
free -h
echo
df -h / | tail -1
echo

TOTAL_MEM_MB=$(free -m | awk '/^Mem:/ {print $2}')
TOTAL_SWAP_MB=$(free -m | awk '/^Swap:/ {print $2}')
log "RAM: ${TOTAL_MEM_MB} MB · Swap: ${TOTAL_SWAP_MB} MB"

# ----- 2) Swap anlegen falls nötig -----------------------------------------
NEED_SWAP_MB=4096
if [ "$TOTAL_SWAP_MB" -lt "$NEED_SWAP_MB" ]; then
  warn "Weniger als ${NEED_SWAP_MB} MB Swap — lege permanenten 4 GB Swap-File an"
  if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
      echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    ok "Swap-File /swapfile (4 GB) angelegt und aktiv"
  else
    sudo swapon /swapfile || true
    ok "Vorhandene /swapfile aktiviert"
  fi
  # vm.swappiness moderat für Build
  sudo sysctl -w vm.swappiness=20 >/dev/null || true
  free -h
else
  ok "Genug Swap vorhanden (${TOTAL_SWAP_MB} MB)"
fi

# ----- 3) Alten Container stoppen, damit der Build alle Ressourcen bekommt -
cd "$(dirname "$0")/.."   # /opt/navoria/deploy
if docker compose ps --status running --quiet app | grep -q .; then
  log "Stoppe alten 'app'-Container temporär (mehr RAM für Build)"
  docker compose stop app || true
  ok "app-Container gestoppt"
else
  warn "app-Container läuft aktuell nicht (oder noch nie deployed)"
fi

# ----- 4) BuildKit-Build mit Cache -----------------------------------------
log "Docker-Image bauen (BuildKit + Cache aktiviert)"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
# --pull=false spart Zeit, wenn kein Base-Image-Update nötig; entfernen falls neu
docker compose build \
  --progress=plain \
  app 2>&1 | tail -80
ok "Build fertig"

# ----- 5) Stack starten ----------------------------------------------------
log "Stack hochfahren"
docker compose up -d
sleep 3
docker compose ps

log "App-Logs (letzte 40 Zeilen)"
docker compose logs --tail=40 app || true

ok "Deploy abgeschlossen — checke https://navoria.de"
