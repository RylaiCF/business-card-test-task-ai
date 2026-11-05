# Issue 05: GraphQL Resolvers, Field Resolvers, and ObjectTypes

Status: resolved

## Description
Build the Code-First GraphQL API exposing the digital business card queries and Apollo Sandbox.

## Scope
- Define GraphQL ObjectTypes:
  - `ProfileType`, `ProfileLinkType`
  - `ExperienceType`, `AchievementType`
  - `ProjectType`
  - `SkillType`
- Implement Root Query Resolvers (`@Query()`):
  - `profile`: returns the specialist's profile.
- Implement Field Resolvers (`@ResolveField()`):
  - `Profile.skills`, `Profile.experience`, `Profile.projects`, `Profile.profileLinks` invoking respective DataLoaders from context.
  - `Experience.achievements` invoking achievements DataLoader.
- Enable Apollo Sandbox in GraphQLModule configuration.
- Auto-generate `schema.gql`.

## Answer
The GraphQL layer (Presentation layer) has been completely implemented and verified:
- **ObjectTypes** created in `src/presentation/types/`:
  - `ProfileType` (`Profile`): aggregate exposing `name`, `description`, `profileLinks`, `skills`, `experience`, `projects`.
  - `ProfileLinkType` (`ProfileLink`): social/external links (`platform`, `url`).
  - `ExperienceType` (`Experience`): work history record with `achievements` relation.
  - `AchievementType` (`Achievement`): key measurable accomplishment with `description`.
  - `ProjectType` (`Project`): portfolio project showcase (`name`, `url`).
  - `SkillType` (`Skill`): engineering competency (`name`).
  - Barrel export in `src/presentation/types/index.ts`.
- **Query & Field Resolvers** created in `src/presentation/resolvers/`:
  - `ProfileResolver`: exposes `@Query(() => ProfileType, { name: 'profile' })`, and field resolvers (`@ResolveField()`) for `profileLinks`, `skills`, `experience`, `projects` delegating to request-scoped DataLoaders (`@Context('loaders')`).
  - `ExperienceResolver`: exposes field resolver for `achievements` using `achievementsByExperienceIdLoader`.
  - Barrel export in `src/presentation/resolvers/index.ts`.
- **PresentationModule**: encapsulates resolvers and imports `DomainModule`, exported from `src/presentation/presentation.module.ts`.
- **GraphQLModule & Apollo Sandbox**:
  - Configured asynchronously in `AppModule` using `ApolloDriver` and `DataLoaderFactory`.
  - Request context instantiates fresh request-scoped DataLoaders (`loaders: dataLoaderFactory.createDataLoaders()`).
  - Embedded Apollo Sandbox landing page enabled via `ApolloServerPluginLandingPageLocalDefault({ embed: true })`.
  - Code-first schema automatically written to `schema.gql` at root.
  - Required dependency `@as-integrations/express5` pinned at `1.1.2` for NestJS 12 Express 5 support.
- **Unit Tests**:
  - Full unit test coverage in `src/presentation/resolvers/*.spec.ts` testing query delegations and DataLoader field batching.
