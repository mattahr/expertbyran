# syntax=docker/dockerfile:1

FROM node:26.13.1-trixie-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Inga seeds: innehåll bor i SQLite på volymen (skapas/migreras vid start),
# sajtconfig bundlas via src/config/site-config.json. Builden behöver ingen data
# — inget innehåll prerendras.
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:1d736cf8b5716c07a245301f92717143215d248fd55771ee1936ef4b3302e531 AS runner
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
