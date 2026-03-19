# ============================================
# Stage 1: Dependencies Installation
# ============================================
# Обновлять до актуальной LTS-версии Node.js:
# https://nodejs.org/en/about/releases/
# Node.js 24 LTS — актуальная версия из официального Vercel примера
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
# OpenSSL для Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# ── Build Args ────────────────────────────────────────────
# NEXT_PUBLIC_* инлайнятся в клиентский JS при `next build`.
# DATABASE_URL нужен для `prisma generate` (не подключается к БД).

# ──────────────────────────────────────────────────────────

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
RUN mkdir .next
RUN chown node:node .next

# Standalone output
RUN mkdir -p .next/cache && chown -R node:node .next

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Запуск от непривилегированного пользователя
USER node

EXPOSE 3000

CMD ["node", "server.js"]