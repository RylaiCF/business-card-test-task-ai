# Issue 03: Persistence Layer and DataLoader Batching

Status: resolved

## Description
Implement the persistence layer (PrismaService and Repositories) and a request-scoped DataLoader factory to eliminate N+1 queries.

## Scope
- Implement `PrismaService` managing database lifecycle and connection.
- Implement domain repositories or data access methods:
  - `ProfileRepository`
  - `ExperienceRepository`
  - `ProjectRepository`
  - `SkillRepository`
  - `AchievementRepository`
  - `ProfileLinkRepository`
- Create DataLoaders for batch loading:
  - `skillsByProfileIdLoader`: batch loads skills for profiles using single `IN` query.
  - `experiencesByProfileIdLoader`: batch loads experiences for profiles.
  - `achievementsByExperienceIdLoader`: batch loads achievements for experiences.
  - `projectsByProfileIdLoader`: batch loads projects for profiles.
  - `profileLinksByProfileIdLoader`: batch loads profile links for profiles.
- Integrate DataLoader factory into Apollo GraphQL Context (`IDataLoaders`).

## Answer
The persistence layer and request-scoped DataLoaders have been implemented:
- `PrismaService` created in `src/persistence/prisma.service.ts` implementing `OnModuleInit` and `OnModuleDestroy` for lifecycle management.
- Domain repositories implemented in `src/persistence/repositories/`:
  - `ProfileRepository`: `findFirst()`, `findById(id)`.
  - `ExperienceRepository`: `findByProfileIds(profileIds)`, `findAll()`, `findByProfileId(profileId)`.
  - `AchievementRepository`: `findByExperienceIds(experienceIds)`, `findByExperienceId(experienceId)`.
  - `ProjectRepository`: `findByProfileIds(profileIds)`, `findAll()`, `findByProfileId(profileId)`.
  - `SkillRepository`: `findByProfileIds(profileIds)`, `findAll()`, `findByProfileId(profileId)`.
  - `ProfileLinkRepository`: `findByProfileIds(profileIds)`, `findByProfileId(profileId)`.
- DataLoader factory and types implemented in `src/persistence/dataloaders/dataloader.factory.ts`:
  - `IDataLoaders` and `GraphQLContext` interfaces defined.
  - `createDataLoaders(prisma: PrismaService)` instantiating the 5 DataLoaders with single SQL `IN` queries, empty result handling, and order preservation (chronological descending for experiences, ascending order for achievements).
  - `DataLoaderFactory` injectable service created.
- `PersistenceModule` created in `src/persistence/persistence.module.ts` exporting `PrismaService`, repositories, and `DataLoaderFactory`.
- Comprehensive unit tests created for `PrismaService`, all repositories, and DataLoader batching/grouping/order preservation in `src/persistence/`.
- All tests (`npm test`) and build (`npm run build`) passing with zero errors.
