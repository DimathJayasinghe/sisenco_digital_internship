# syntax=docker/dockerfile:1
# NestJS API — multi-stage build. Build context is the monorepo root so the
# npm workspace install can resolve @sisenco/shared-types.

# ─────────────────────────────────────────────────────────────
# base — runtime OS with the libs Prisma needs (OpenSSL).
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS base
WORKDIR /repo
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────────────────────
# deps — production-only node_modules (native addons compiled here,
#        so the final runner needs no build toolchain).
# ─────────────────────────────────────────────────────────────
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────
# builder — full install, then build shared-types + generate the
#           Prisma client + compile the Nest app.
# ─────────────────────────────────────────────────────────────
FROM base AS builder
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
RUN npm ci
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
RUN npm run build --workspace @sisenco/shared-types \
  && npx prisma generate --schema apps/api/prisma/schema.prisma \
  && npm run build --workspace api

# ─────────────────────────────────────────────────────────────
# runner — minimal image: prod deps + compiled output only.
# ─────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
# Production dependencies (hoisted to the workspace root by npm).
COPY --from=deps /repo/node_modules ./node_modules
# Generated Prisma client (produced during `prisma generate` in the builder).
COPY --from=builder /repo/node_modules/.prisma ./node_modules/.prisma
# Built shared-types package (the @sisenco/shared-types symlink resolves here).
COPY --from=builder /repo/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /repo/packages/shared-types/package.json ./packages/shared-types/package.json
# Compiled API + its Prisma schema (kept for reference/introspection).
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma

WORKDIR /repo/apps/api
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
