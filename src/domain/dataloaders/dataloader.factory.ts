import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import {
  ProfileLink,
  Experience,
  Achievement,
  Project,
  Skill,
} from '@prisma/client';
import {
  SkillRepository,
  ExperienceRepository,
  AchievementRepository,
  ProjectRepository,
  ProfileLinkRepository,
} from '../../persistence/repositories';

export interface IDataLoaders {
  skillsByProfileIdLoader: DataLoader<string, Skill[]>;
  experiencesByProfileIdLoader: DataLoader<string, Experience[]>;
  achievementsByExperienceIdLoader: DataLoader<string, Achievement[]>;
  projectsByProfileIdLoader: DataLoader<string, Project[]>;
  profileLinksByProfileIdLoader: DataLoader<string, ProfileLink[]>;
}

export interface GraphQLContext {
  loaders: IDataLoaders;
  req?: unknown;
  res?: unknown;
  [key: string]: unknown;
}

export function groupByForeignKey<T, K extends keyof T>(
  keys: readonly string[],
  items: T[],
  foreignKey: K,
): T[][] {
  const map = new Map<string, T[]>();
  for (const key of keys) {
    map.set(key, []);
  }
  for (const item of items) {
    const id = String(item[foreignKey]);
    map.get(id)?.push(item);
  }
  return keys.map((key) => map.get(key) ?? []);
}

@Injectable()
export class DataLoaderFactory {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly experienceRepository: ExperienceRepository,
    private readonly achievementRepository: AchievementRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly profileLinkRepository: ProfileLinkRepository,
  ) {}

  createDataLoaders(): IDataLoaders {
    const skillsByProfileIdLoader = new DataLoader<string, Skill[]>(
      async (profileIds: readonly string[]) => {
        const profileSkills = await this.skillRepository.findByProfileIds([
          ...profileIds,
        ]);
        return groupByForeignKey(profileIds, profileSkills, 'profileId');
      },
    );

    const experiencesByProfileIdLoader = new DataLoader<string, Experience[]>(
      async (profileIds: readonly string[]) => {
        const experiences = await this.experienceRepository.findByProfileIds([
          ...profileIds,
        ]);
        return groupByForeignKey(profileIds, experiences, 'profileId');
      },
    );

    const achievementsByExperienceIdLoader = new DataLoader<
      string,
      Achievement[]
    >(async (experienceIds: readonly string[]) => {
      const achievements = await this.achievementRepository.findByExperienceIds(
        [...experienceIds],
      );
      return groupByForeignKey(experienceIds, achievements, 'experienceId');
    });

    const projectsByProfileIdLoader = new DataLoader<string, Project[]>(
      async (profileIds: readonly string[]) => {
        const projects = await this.projectRepository.findByProfileIds([
          ...profileIds,
        ]);
        return groupByForeignKey(profileIds, projects, 'profileId');
      },
    );

    const profileLinksByProfileIdLoader = new DataLoader<string, ProfileLink[]>(
      async (profileIds: readonly string[]) => {
        const profileLinks = await this.profileLinkRepository.findByProfileIds([
          ...profileIds,
        ]);
        return groupByForeignKey(profileIds, profileLinks, 'profileId');
      },
    );

    return {
      skillsByProfileIdLoader,
      experiencesByProfileIdLoader,
      achievementsByExperienceIdLoader,
      projectsByProfileIdLoader,
      profileLinksByProfileIdLoader,
    };
  }
}
