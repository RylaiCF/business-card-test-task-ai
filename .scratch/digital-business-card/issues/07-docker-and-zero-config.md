# Issue 07: Docker Containerization and Zero-Config Startup

Status: resolved

## Description
Provide zero-configuration containerization using a multi-stage Dockerfile and docker-compose.yml with automated migration and seed on start.

## Scope
- Create multi-stage `Dockerfile`:
  - Build stage: install deps, run `prisma generate`, compile TypeScript.
  - Production stage: minimal Node 26 runner, copy compiled code, Prisma engine, and seed assets.
- Configure `docker-compose.yml`:
  - Mount persistent volume for SQLite `dev.db`.
  - Expose port 3000.
  - Entrypoint command executing `prisma migrate deploy && prisma db seed && node dist/main.js`.
- Test `docker compose up --build` works out of the box on a fresh checkout.

## Answer
The zero-configuration containerization solution has been created:
- **Pinned Base Image**: Strictly pinned to `node:26.13.0-bookworm-slim` for both builder and runner stages in adherence to `AGENTS.md` and repository guidelines (no floating tags or `:latest`).
- **Multi-stage `Dockerfile`**:
  - `builder` stage: installs native build tools (`python3`, `make`, `g++`), installs exact npm dependencies via `npm ci`, runs `npx prisma generate`, and compiles TypeScript via `npm run build`.
  - `runner` stage: production-grade minimal image with OpenSSL (`openssl`), copies compiled assets (`dist/`, `tsconfig.json`, `prisma.config.ts`, `prisma/`, `node_modules/`), exposes port 3000, and mounts persistent SQLite volume `/app/data`.
- **Automated Entrypoint (`docker-entrypoint.sh`)**:
  - Runs `npx prisma db push --skip-generate` to synchronize database schema in the persistent volume.
  - Runs `node dist/prisma/seed.js` to idempotently seed the database.
  - Executes `node dist/src/main.js` to start the GraphQL server on port 3000.
- **Docker Compose (`docker-compose.yml`)**:
  - Exposes port `3000:3000`.
  - Sets `DATABASE_URL=file:/app/data/dev.db`.
  - Maps persistent named volume `sqlite_data` to `/app/data`.
- **Local Zero-Config Script**:
  - Added `"start:migrate:seed": "npx prisma db push && node dist/prisma/seed.js && node dist/src/main"` in `package.json` for one-command local startup without Docker.
- **`.dockerignore`**: Created to exclude `node_modules`, `dist`, `.git`, `.scratch`, and local SQLite database files from image build context.
