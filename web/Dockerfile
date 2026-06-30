# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Inga seeds: innehåll bor i SQLite på volymen (skapas/migreras vid start),
# sajtconfig bundlas via src/config/site-config.json. Builden behöver ingen data
# — inget innehåll prerendras.
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/app/data

# --chown=65532 (distroless nonroot-uid): annars ägs /app av root och Nexts
# datacache kan inte persistera till .next/cache (EACCES → enbart in-memory).
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=builder --chown=65532:65532 /app/public ./public
# Buntad offline geo-databas (DB-IP Country Lite) — standalone-tracingen tar
# inte med datafiler, så den kopieras explicit. Läses via GEOIP_DB ?? cwd/geoip.
COPY --from=builder --chown=65532:65532 /app/geoip ./geoip

EXPOSE 3000

CMD ["server.js"]
