import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import {
  ProfileLink,
  Experience,
  Achievement,
  Project,
  Skill,
} from '../types';
import { PrismaService } from '../../persistence/prisma.service';

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

export function createRelationLoader<T, K extends keyof T, R = T>(
  fetcher: (keys: readonly string[]) => Promise<T[]>,
  foreignKey: K,
): DataLoader<string, R[]> {
  return new DataLoader<string, R[]>(async (keys: readonly string[]) => {
    const items = await fetcher(keys);
    return groupByForeignKey(keys, items, foreignKey) as unknown as R[][];
  });
}

@Injectable()
export class DataLoaderFactory {
  constructor(private readonly prisma: PrismaService) {}

  createDataLoaders(): IDataLoaders {
    const skillsByProfileIdLoader = createRelationLoader<
      Skill & { profileId: string },
      'profileId',
      Skill
    >(
      async (profileIds: readonly string[]) => {
        const profileSkills = await this.prisma.profileSkill.findMany({
          where: {
            profileId: { in: [...profileIds] },
          },
          include: {
            skill: true,
          },
        });

        return profileSkills.map((ps) => ({
          ...ps.skill,
          profileId: ps.profileId,
        }));
      },
      'profileId',
    );

    const experiencesByProfileIdLoader = createRelationLoader(
      async (profileIds: readonly string[]) =>
        this.prisma.experience.findMany({
          where: {
            profileId: { in: [...profileIds] },
          },
          orderBy: {
            startDate: 'desc',
          },
        }),
      'profileId',
    );

    const achievementsByExperienceIdLoader = createRelationLoader(
      async (experienceIds: readonly string[]) =>
        this.prisma.achievement.findMany({
          where: {
            experienceId: { in: [...experienceIds] },
          },
          orderBy: {
            order: 'asc',
          },
        }),
      'experienceId',
    );

    const projectsByProfileIdLoader = createRelationLoader(
      async (profileIds: readonly string[]) =>
        this.prisma.project.findMany({
          where: {
            profileId: { in: [...profileIds] },
          },
        }),
      'profileId',
    );

    const profileLinksByProfileIdLoader = createRelationLoader(
      async (profileIds: readonly string[]) =>
        this.prisma.profileLink.findMany({
          where: {
            profileId: { in: [...profileIds] },
          },
        }),
      'profileId',
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
