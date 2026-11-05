#!/bin/sh
set -e

echo "[Docker Entrypoint] Synchronizing database schema..."
npx prisma migrate deploy

echo "[Docker Entrypoint] Seeding initial portfolio data..."
node dist/prisma/seed.js

echo "[Docker Entrypoint] Starting Vizitka GraphQL application on port ${PORT:-3000}..."
exec node dist/src/main.js
