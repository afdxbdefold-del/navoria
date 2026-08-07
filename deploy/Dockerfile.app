# syntax=docker/dockerfile:1.6
# Multi-stage Dockerfile für Navoria (Next.js 15 + App Router + MongoDB Client)
# Optimiert mit BuildKit-Cache-Mounts – yarn install und .next-Cache werden
# zwischen Builds wiederverwendet. Erster Build ~4 min, folgende ~1–2 min.

# ---------- Stage 1: Dependencies ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock* ./
# yarn-Cache wird über BuildKit gemountet und persistiert
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --production=false --network-timeout 600000 --frozen-lockfile || \
    yarn install --production=false --network-timeout 600000

# ---------- Stage 2: Build ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Heap auf 2 GB begrenzt: paradoxerweise stabiler auf VPS mit wenig RAM,
# weil zu großer Heap schlechteres GC-Verhalten hat und mehr swappt.
# Falls Build weiter OOM-crasht → auf 1536 reduzieren.
ENV NODE_OPTIONS='--max-old-space-size=2048'
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
# .next-Cache über BuildKit persistieren, damit unveränderte Chunks nicht neu kompiliert werden
RUN --mount=type=cache,target=/app/.next/cache \
    yarn build

# ---------- Stage 3: Runtime (Standalone) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Nur wget für Healthcheck, sonst nichts. Kleines Image.
RUN apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Standalone-Output enthält einen selbst-gebauten server.js mit minimal nötigen node_modules.
# Reduziert Image-Größe von ~2 GB auf ~250 MB und Startzeit von ~15s auf ~2s.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
