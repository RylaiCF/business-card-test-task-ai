# Digital Business Card Backend (Vizitka)

A production-grade NestJS backend application implementing a digital business card (portfolio) for a software engineer. The service exposes a code-first GraphQL API with Apollo Sandbox, powered by Prisma ORM and SQLite, containerized via Docker with automated zero-configuration migrations and seeding.

---

## 🏛️ Architecture & Design Philosophy

The application follows a strict **3-Tier Modular Clean Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                     │
│  - GraphQL ObjectTypes (Profile, Skill, Experience, etc.)   │
│  - Query Resolvers (@Query)                                  │
│  - Field Resolvers (@ResolveField) using DataLoaders        │
└──────────────────────────────┬──────────────────────────────┘
                               │ calls
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain / Application Layer               │
│  - Domain Services (ProfileService, SkillService, etc.)     │
│  - Request-scoped DataLoaders (DataLoaderFactory)           │
│  - Business logic, domain invariants, not-found exceptions  │
└──────────────────────────────┬──────────────────────────────┘
                               │ calls
┌──────────────────────────────▼──────────────────────────────┐
│                      Persistence Layer                      │
│  - Repositories (ProfileRepository, SkillRepository, etc.)  │
│  - Database Migrations & Seed (Prisma Migrate & Seed)       │
│  - Prisma ORM (PrismaClient with Driver Adapter)            │
│  - SQLite Database (dev.db / test.db)                       │
└─────────────────────────────────────────────────────────────┘
```

### 1. Presentation Layer (`src/presentation/`)
- Code-first GraphQL schemas defined via TypeScript classes and `@nestjs/graphql` decorators.
- Decoupled from database implementations; delegates to Domain Services for root query resolution.
- Field resolvers invoke request-scoped DataLoaders passed through GraphQL context (`@Context('loaders')`).
- Auto-generates `schema.gql` on application startup.

### 2. Domain / Application Layer (`src/domain/`)
- Encapsulates business rules and entity relationships.
- Manages request-scoped `DataLoaderFactory` batching relations into single SQL `IN` queries.
- Keeps data retrieval and error semantics clean (e.g. `NotFoundException('Profile not found')`).
- Completely independent of HTTP or GraphQL transport mechanisms.

### 3. Persistence Layer (`src/persistence/`)
- Abstracted behind Repositories implementing data access methods.
- Powered by Prisma 7 utilizing `@prisma/adapter-better-sqlite3`.
- Ensures zero-config database preparation and seeding on startup (`prisma migrate deploy && prisma db seed`).

---

## ⚡ Solving the N+1 Problem with DataLoaders

When querying nested relationships in GraphQL (such as fetching achievements for each experience or skills for a profile), a naive implementation triggers the **N+1 problem** (1 query for the parent list, and N individual queries for each child).

### How Vizitka Solves It:
- **Request-scoped batching**: Configured in Apollo Server driver context factory (`AppModule`). For each incoming HTTP request, a fresh set of DataLoaders is instantiated.
- **Why Apollo Context over NestJS `Scope.REQUEST`?** As documented in [ADR-0004](docs/adr/0004-request-scoped-dataloaders-via-apollo-context.md), NestJS request scoping recreates the entire dependency injection subtree per request, degrading throughput. Initializing DataLoaders inside the Apollo context factory provides zero-overhead request isolation.
- **Verified Zero N+1 Queries**: The end-to-end test suite (`test/graphql.e2e-spec.ts`) spies on Prisma query methods during a deeply nested query traversal (Profile → 44 Skills, 7 Experiences → nested Achievements, 10 Projects, 3 Links) and asserts that **each child collection executes exactly 1 batch query** (`WHERE in (...)`), executing only 6 total queries for the entire aggregate.

For further architectural rationale, see:
- [ADR-0001: SQLite as Embedded Database Engine](docs/adr/0001-sqlite-embedded-database.md)
- [ADR-0002: DataLoader for Nested Relations](docs/adr/0002-dataloader-for-nested-relations.md)
- [ADR-0003: Read-Only Public GraphQL API](docs/adr/0003-read-only-public-graphql-api.md)
- [ADR-0004: Request-Scoped DataLoaders via Apollo Context](docs/adr/0004-request-scoped-dataloaders-via-apollo-context.md)
- [GLOSSARY.md: Canonical Domain Vocabulary](GLOSSARY.md)

---

## 🚀 Quick Start (Zero-Config Startup)

### Option A: Docker Compose (Recommended)

Requires Docker Desktop or Docker Engine.

```bash
# Clone the repository
git clone https://github.com/RylaiCF/business-card-test-task-ai.git
cd business-card-test-task-ai

# Start the containerized service
docker compose up --build
```

The container automatically:
1. Applies Prisma database migrations.
2. Idempotently seeds initial portfolio data (Profile, Skills, Experiences, Achievements, Projects).
3. Boots NestJS with Apollo Sandbox available at: **`http://localhost:3000/graphql`**

### Option B: Local Development

Requires **Node.js 26.13.0 LTS** and `npm`.

```bash
# 1. Install pinned dependencies
npm install

# 2. Push Prisma schema & seed database
npm run start:migrate:seed

# 3. Or start in development watch mode
npm run start:dev
```

Open **`http://localhost:3000/graphql`** in your browser to interact with the Apollo Sandbox.

---

## 🔍 GraphQL API Query

Fetches the complete digital business card with all nested relations:

```graphql
query GetSpecialistProfile {
  profile {
    name
    description
    profileLinks {
      platform
      url
    }
    skills {
      name
    }
    experience {
      company
      position
      startDate
      endDate
      isCurrent
      achievements {
        description
      }
    }
    projects {
      name
      url
    }
  }
}
```

Or the minimal query from the task specification:

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

---

## 🧪 Testing Suite

The project includes unit, integration, and end-to-end tests:

```bash
# Run unit & integration tests (Vitest)
npm test

# Run E2E test suite (verifying GraphQL API and N+1 prevention)
npm run test:e2e

# Run test coverage report
npm run test:cov

# Run linter
npm run lint

# Build production bundle
npm run build
```

---

## 🚢 Production Deployment

The application is containerized using a multi-stage Docker build with strictly pinned base images (`node:26.13.0-bookworm-slim`).

### Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port the server listens on | `3000` |
| `DATABASE_URL` | SQLite file connection string | `file:/app/data/dev.db` |
| `NODE_ENV` | Runtime environment | `production` |

### Deploying to Cloud Hosts (Railway / Render / Fly.io)
1. **Repository**: Connect this repository to your platform.
2. **Build Type**: Select `Dockerfile` (or Docker Compose).
3. **Volume**: Attach a persistent volume mounted at `/app/data` to persist the SQLite database between redeploys.
4. **Port**: Expose port `3000`.

---

## 📄 License

UNLICENSED
