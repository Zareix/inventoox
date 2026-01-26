FROM oven/bun:1.3.5 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build


FROM oven/bun:1.3.5-distroless AS runner

WORKDIR /app

COPY drizzle /app/drizzle
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["./.output/server/index.mjs"]
