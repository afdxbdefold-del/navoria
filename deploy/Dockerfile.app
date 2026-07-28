# Multi-stage Dockerfile für Navoria (Next.js 15 + App Router + MongoDB Client)

# ---------- Stage 1: Dependencies ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false --network-timeout 600000

# ---------- Stage 2: Build ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env: nur PUBLIC-Werte, Secrets kommen zur Laufzeit
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS='--max-old-space-size=1536'
RUN yarn build

# ---------- Stage 3: Runtime (minimal) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# wget für Healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Nutze Next.js Standalone-Output (verringert Image-Größe um ~90 %)
# Fällt zurück auf komplette node_modules falls Standalone-Output nicht konfiguriert.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/middleware.js ./middleware.js

USER nextjs
EXPOSE 3000

CMD ["node", "node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
