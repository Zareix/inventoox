FROM oven/bun:1.3.6 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build


FROM oven/bun:1.3.6-distroless AS runner

WORKDIR /app

COPY drizzle /app/drizzle
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/db/db.sqlite

EXPOSE 3000

CMD ["./.output/server/index.mjs"]
