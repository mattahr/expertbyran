# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN mkdir -p /app/data/blog/posts /app/data/foresight /app/data/radar \
 && cp site-data.json /app/data/site-data.json \
 && cp blog-data.json /app/data/blog-data.json \
 && cp foresight-data.json /app/data/foresight-data.json \
 && cp radar-data.json /app/data/radar-data.json \
 && if [ -d blog/posts ] && [ "$(ls -A blog/posts 2>/dev/null)" ]; then cp blog/posts/*.md /app/data/blog/posts/; fi \
 && if [ -d foresight ] && [ "$(ls -A foresight 2>/dev/null)" ]; then cp foresight/*.md /app/data/foresight/; fi \
 && if [ -d radar ] && [ "$(ls -A radar 2>/dev/null)" ]; then cp radar/*.json /app/data/radar/; fi
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV SITE_DATA_URL=api
ENV SITE_DATA_REVALIDATE_SECONDS=300

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy initial data to a seed directory
COPY --from=builder /app/site-data.json /app/seed/site-data.json
COPY --from=builder /app/blog-data.json /app/seed/blog-data.json
COPY --from=builder /app/blog /app/seed/blog
COPY --from=builder /app/foresight-data.json /app/seed/foresight-data.json
COPY --from=builder /app/foresight /app/seed/foresight
COPY --from=builder /app/radar-data.json /app/seed/radar-data.json
COPY --from=builder /app/radar /app/seed/radar

EXPOSE 3000

CMD ["server.js"]
