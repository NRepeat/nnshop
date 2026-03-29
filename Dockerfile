# ============================================
# Stage 1: Dependencies Installation
# ============================================
ARG NODE_VERSION=24.13.0-slim
FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ============================================
# Stage 2: Build Next.js (standalone mode)
# ============================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# OpenSSL для Prisma + curl для healthcheck
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# NEXT_PUBLIC_* инлайнятся в клиентский JS при `next build`.
# Передаются через --build-arg или .env.production.local (COPY'd выше).
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Публичные файлы
COPY --from=builder --chown=node:node /app/public ./public

# Директория для ISR prerender-кэша
RUN mkdir -p .next/cache && chown -R node:node .next

# Standalone output
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Запуск от непривилегированного пользователя
USER node

EXPOSE 3000

CMD ["node", "server.js"]
