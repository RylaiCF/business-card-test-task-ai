# Issue 08: README and Architecture Documentation

Status: resolved

## Description
Write complete project documentation explaining architecture, design decisions, GraphQL schema, N+1 solution, and local/Docker run instructions.

## Scope
- Document architectural layers and design philosophy.
- Explain N+1 optimization and reference [ADR-0002](file:///d:/Projects/vizitka/docs/adr/0002-dataloader-for-nested-relations.md).
- Explain database choice and reference [ADR-0001](file:///d:/Projects/vizitka/docs/adr/0001-sqlite-embedded-database.md).
- Provide step-by-step instructions for:
  - Local development (`npm install`, `npm run start:dev`).
  - Docker zero-config run (`docker compose up --build`).
  - Running tests (`npm run test`, `npm run test:e2e`).
  - Accessing Apollo Sandbox and example queries.
- Add deployment instructions for Railway / Render.

## Answer
The project documentation has been fully completed in `README.md`:
- **Architecture**: Comprehensive explanation of the 3-tier modular architecture (Presentation, Domain, Persistence) with ASCII workflow diagram.
- **N+1 Optimization**: Documented DataLoader batching design, explaining why request-scoped Apollo context factory was chosen over NestJS `Scope.REQUEST`, referencing ADR-0002 and ADR-0004.
- **Database Choice**: Detailed explanation of SQLite embedded database via Prisma 7 Driver Adapters for instant, zero-config startup and deterministic reproducibility, referencing ADR-0001.
- **Getting Started**:
  - Docker Compose instructions (`docker compose up --build`) for zero-config run with persistent volumes and Apollo Sandbox.
  - Local development setup with `npm run start:migrate:seed` and `npm run start:dev`.
- **GraphQL API Queries**: Documented example queries for the specialist profile graph and specification target query.
- **Testing & Deployment**: Documented commands for Vitest unit/integration tests, E2E tests with N+1 assertions, and production deployment guidelines for cloud container hosts (Railway, Render, Fly.io).
