# syntax=docker/dockerfile:1

# ── 1. Dependencies ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── 3. Production image ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets (directory may be empty for a minimal Hello World setup)
RUN mkdir -p public
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
