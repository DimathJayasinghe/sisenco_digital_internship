# syntax=docker/dockerfile:1
# Next.js web — multi-stage build producing a standalone server. Build context
# is the monorepo root so @sisenco/shared-types resolves during the workspace build.

# ─────────────────────────────────────────────────────────────
# base
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS base
WORKDIR /repo

# ─────────────────────────────────────────────────────────────
# builder — install, build shared-types, then `next build` (standalone).
# ─────────────────────────────────────────────────────────────
FROM base AS builder
# next.config.mjs's rewrites() destination is resolved once by `next build`
# and frozen into .next/routes-manifest.json — the standalone server does not
# re-read it at runtime. So API_URL must be a build arg, not just a runtime
# `environment:` entry in docker-compose.yml (which has no effect on it).
ARG API_URL=http://api:3001
ENV API_URL=$API_URL
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
RUN npm ci
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web
RUN npm run build --workspace @sisenco/shared-types \
  && npm run build --workspace web

# ─────────────────────────────────────────────────────────────
# runner — copy only the self-contained standalone output.
# ─────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Standalone bundle (server + traced node_modules, monorepo layout preserved).
COPY --from=builder /repo/apps/web/.next/standalone ./
# Static assets are not part of the standalone bundle — copy them alongside.
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
