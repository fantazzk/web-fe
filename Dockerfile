# --- deps ---
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# --- build ---
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# --- runtime ---
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER app

CMD ["bun", "./build/index.js"]
