# Specification: Digital Business Card Backend (Vizitka)

## Overview
A production-grade NestJS backend application implementing a digital business card (portfolio) for a software engineer, exposing a GraphQL API with Apollo Sandbox, powered by Prisma ORM and SQLite, fully containerized via Docker.

## Goals
1. Provide a single-source-of-truth GraphQL API satisfying the requirement:
   ```graphql
   query {
     profile {
       name
       description
       skills {
         name
       }
       experience {
         company
         position
       }
       projects {
         name
       }
     }
   }
   ```
2. Solve the N+1 problem on nested relations (`skills`, `experience`, `projects`, `profileLinks`, `achievements`) using request-scoped DataLoaders.
3. Enforce strict 3-tier modular architecture:
   - **Presentation Layer**: GraphQL Resolvers, Field Resolvers, ObjectTypes.
   - **Domain/Application Layer**: Services, business logic, DataLoader management.
   - **Persistence Layer**: Repositories, Prisma client, SQLite storage.
4. Provide zero-config execution: `docker compose up --build` or `npm run start:migrate:seed` boots the database, runs migrations, populates initial portfolio data, and starts the server with Apollo Sandbox available at `http://localhost:3000/graphql`.
5. Maintain documentation: `GLOSSARY.md`, ADR records in `docs/adr/`, and detailed `README.md` justifying technical decisions.

## Domain Model
- **Profile**: id, name, description.
- **ProfileLink**: id, profileId, platform, url.
- **Experience**: id, profileId, company, position, startDate, endDate, isCurrent.
- **Achievement**: id, experienceId, description, order.
- **Project**: id, profileId, name, url.
- **Skill**: id, name.
- **ProfileSkill**: profileId, skillId (Many-to-Many junction).

## Tech Stack
- **Runtime**: Node.js 26.13.0 LTS
- **Framework**: NestJS 12
- **Language**: TypeScript 5.9+
- **API**: GraphQL (Code-First) + Apollo Server v5 (`@nestjs/apollo`, `@as-integrations/express5`)
- **Batching**: DataLoader
- **ORM / Database**: Prisma 7 (`@prisma/adapter-better-sqlite3`) + SQLite
- **Containerization**: Docker (multi-stage) + Docker Compose
- **Testing**: Vitest (Unit & E2E via Supertest)
