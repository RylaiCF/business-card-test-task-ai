# Issue 04: Domain Services and Business Logic

Status: resolved

## Description
Implement domain services to encapsulate business rules and query orchestration, keeping resolvers decoupled from database details.

## Scope
- Implement `ProfileService`: retrieve active profile, orchestrate relations.
- Implement `ExperienceService`, `ProjectService`, `SkillService`.
- Implement clean exception handling and logging.
- Ensure strict separation of concerns: services do not leak GraphQL or transport concerns.

## Answer
The domain services and business logic layer have been implemented:
- `ProfileService` in `src/domain/services/profile.service.ts`:
  - `getProfile()`: retrieves specialist root profile via `ProfileRepository.findFirst()`, throwing `NotFoundException('Profile not found')` when missing.
  - `getProfileById(id: string)`: retrieves profile by ID or throws `NotFoundException('Profile not found')`.
- `ExperienceService` in `src/domain/services/experience.service.ts`:
  - `getAllExperiences()`: retrieves all experiences ordered chronologically.
  - `getExperiencesByProfileId(profileId: string)`: retrieves experiences for a specific profile.
- `ProjectService` in `src/domain/services/project.service.ts`:
  - `getAllProjects()`: retrieves all projects.
  - `getProjectsByProfileId(profileId: string)`: retrieves projects for a specific profile.
- `SkillService` in `src/domain/services/skill.service.ts`:
  - `getSkills()`: retrieves all skills.
  - `getSkillsByProfileId(profileId: string)`: retrieves skills for a specific profile.
- `DomainModule` in `src/domain/domain.module.ts`:
  - Imports `PersistenceModule`.
  - Provides and exports `ProfileService`, `ExperienceService`, `ProjectService`, and `SkillService`.
  - Exported through `src/domain/index.ts` and `src/domain/services/index.ts` barrel files.
  - Imported in `src/app.module.ts`.
- Unit tests created in `src/domain/services/*.spec.ts` and `src/domain/domain.module.spec.ts` covering happy paths, edge cases, and `NotFoundException` handling with mocked repositories.
- All test suites (`npm test`), lint (`npm run lint`), and build (`npm run build`) pass.
