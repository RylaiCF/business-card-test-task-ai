# Issue 02: Prisma Schema and Automated Seeding

Status: resolved

## Description
Define the normalized relational schema in Prisma with SQLite provider, generate migrations, and implement an automated seed script.

## Scope
- Define models in `prisma/schema.prisma`:
  - `Profile`
  - `ProfileLink`
  - `Experience`
  - `Achievement`
  - `Project`
  - `Skill`
  - `ProfileSkill`
- Configure `prisma/seed.ts` containing realistic candidate profile data (bio, skills, experience with achievements, projects with links).
- Configure `prisma.seed` in `package.json` for `npx prisma db seed`.
- Verify database generation and migrations.

## Answer
The Prisma schema and automated seeding have been implemented:
- `prisma/schema.prisma` configured with SQLite provider and binary engine compatibility for containerized and local execution.
- Relational models implemented adhering to domain glossary (`Profile`, `ProfileLink`, `Experience`, `Achievement`, `Project`, `Skill`, and `ProfileSkill` junction).
- Initial migration generated via `prisma migrate dev`.
- Comprehensive idempotent seed script `prisma/seed.ts` implemented for Kirill Gorbunov with detailed skill breakdown, experiences with achievements, and showcase projects.
- Database seed integrity tests written and verified in `src/database/seed-integrity.spec.ts`.
- `package.json` updated with `"prisma": { "seed": "ts-node prisma/seed.ts" }` without modifying pinned versions.
