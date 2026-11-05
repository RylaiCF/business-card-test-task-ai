import {
  DataLoaderFactory,
  groupByForeignKey,
  createRelationLoader,
  IDataLoaders,
} from './dataloader.factory';
import { PrismaService } from '../../persistence/prisma.service';

describe('DataLoaderFactory & Batching Mechanics', () => {
  let factory: DataLoaderFactory;
  let loaders: IDataLoaders;

  let prisma: {
    profileSkill: { findMany: any };
    experience: { findMany: any };
    achievement: { findMany: any };
    project: { findMany: any };
    profileLink: { findMany: any };
  };

  beforeEach(() => {
    prisma = {
      profileSkill: { findMany: vi.fn() },
      experience: { findMany: vi.fn() },
      achievement: { findMany: vi.fn() },
      project: { findMany: vi.fn() },
      profileLink: { findMany: vi.fn() },
    };

    factory = new DataLoaderFactory(prisma as unknown as PrismaService);
    loaders = factory.createDataLoaders();
  });

  describe('groupByForeignKey helper', () => {
    it('should correctly group items by matching foreign key and preserve key ordering', () => {
      const keys = ['p1', 'p2', 'p3'];
      const items = [
        { id: '1', parentId: 'p2' },
        { id: '2', parentId: 'p1' },
        { id: '3', parentId: 'p1' },
      ];

      const result = groupByForeignKey(keys, items, 'parentId');

      expect(result).toEqual([
        [
          { id: '2', parentId: 'p1' },
          { id: '3', parentId: 'p1' },
        ],
        [{ id: '1', parentId: 'p2' }],
        [],
      ]);
    });

    it('should return empty arrays for keys with no matching items', () => {
      const keys = ['x', 'y'];
      const items = [{ id: '1', parentId: 'z' }];

      const result = groupByForeignKey(keys, items, 'parentId');

      expect(result).toEqual([[], []]);
    });
  });

  describe('createRelationLoader helper', () => {
    it('should batch keys into a single fetcher invocation and group results by foreignKey', async () => {
      const fetcher = vi.fn().mockResolvedValue([
        { id: '1', parentId: 'k2' },
        { id: '2', parentId: 'k1' },
      ]);
      const loader = createRelationLoader(fetcher, 'parentId');

      const [k1Res, k2Res, k3Res] = await Promise.all([
        loader.load('k1'),
        loader.load('k2'),
        loader.load('k3'),
      ]);

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher).toHaveBeenCalledWith(['k1', 'k2', 'k3']);
      expect(k1Res).toEqual([{ id: '2', parentId: 'k1' }]);
      expect(k2Res).toEqual([{ id: '1', parentId: 'k2' }]);
      expect(k3Res).toEqual([]);
    });
  });

  describe('skillsByProfileIdLoader', () => {
    it('should batch multiple profile IDs into a single query via prisma.profileSkill.findMany', async () => {
      const ps1 = {
        profileId: 'p1',
        skillId: 's1',
        skill: { id: 's1', name: 'TypeScript' },
      };
      const ps2 = {
        profileId: 'p1',
        skillId: 's2',
        skill: { id: 's2', name: 'PostgreSQL' },
      };
      const ps3 = {
        profileId: 'p2',
        skillId: 's3',
        skill: { id: 's3', name: 'Docker' },
      };

      prisma.profileSkill.findMany.mockResolvedValue([ps3, ps1, ps2]);

      const [p1Skills, p2Skills, p3Skills] = await Promise.all([
        loaders.skillsByProfileIdLoader.load('p1'),
        loaders.skillsByProfileIdLoader.load('p2'),
        loaders.skillsByProfileIdLoader.load('p3'),
      ]);

      expect(prisma.profileSkill.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.profileSkill.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['p1', 'p2', 'p3'] } },
        include: { skill: true },
      });

      expect(p1Skills).toEqual([
        { id: 's1', name: 'TypeScript', profileId: 'p1' },
        { id: 's2', name: 'PostgreSQL', profileId: 'p1' },
      ]);
      expect(p2Skills).toEqual([
        { id: 's3', name: 'Docker', profileId: 'p2' },
      ]);
      expect(p3Skills).toEqual([]);
    });
  });

  describe('experiencesByProfileIdLoader', () => {
    it('should batch profile IDs into single query with desc startDate ordering', async () => {
      const exp1 = {
        id: 'e1',
        profileId: 'p1',
        company: 'Corp A',
        position: 'Senior',
        startDate: new Date('2022-01-01'),
        endDate: null,
        isCurrent: true,
      };
      const exp2 = {
        id: 'e2',
        profileId: 'p2',
        company: 'Corp B',
        position: 'Lead',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-01-01'),
        isCurrent: false,
      };

      prisma.experience.findMany.mockResolvedValue([exp1, exp2]);

      const [p1Exp, p2Exp, p3Exp] = await Promise.all([
        loaders.experiencesByProfileIdLoader.load('p1'),
        loaders.experiencesByProfileIdLoader.load('p2'),
        loaders.experiencesByProfileIdLoader.load('p3'),
      ]);

      expect(prisma.experience.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.experience.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['p1', 'p2', 'p3'] } },
        orderBy: { startDate: 'desc' },
      });
      expect(p1Exp).toEqual([exp1]);
      expect(p2Exp).toEqual([exp2]);
      expect(p3Exp).toEqual([]);
    });
  });

  describe('achievementsByExperienceIdLoader', () => {
    it('should batch experience IDs into single query with asc order ordering', async () => {
      const a1 = {
        id: 'a1',
        experienceId: 'e1',
        description: 'Reduced latency by 50%',
        order: 1,
      };
      const a2 = {
        id: 'a2',
        experienceId: 'e1',
        description: 'Migrated to NestJS',
        order: 2,
      };
      const a3 = {
        id: 'a3',
        experienceId: 'e2',
        description: 'Built CI/CD pipeline',
        order: 1,
      };

      prisma.achievement.findMany.mockResolvedValue([a3, a1, a2]);

      const [e1Ach, e2Ach, e3Ach] = await Promise.all([
        loaders.achievementsByExperienceIdLoader.load('e1'),
        loaders.achievementsByExperienceIdLoader.load('e2'),
        loaders.achievementsByExperienceIdLoader.load('e3'),
      ]);

      expect(prisma.achievement.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.achievement.findMany).toHaveBeenCalledWith({
        where: { experienceId: { in: ['e1', 'e2', 'e3'] } },
        orderBy: { order: 'asc' },
      });
      expect(e1Ach).toEqual([a1, a2]);
      expect(e2Ach).toEqual([a3]);
      expect(e3Ach).toEqual([]);
    });
  });

  describe('projectsByProfileIdLoader', () => {
    it('should batch profile IDs into single query via prisma.project.findMany', async () => {
      const proj1 = {
        id: 'pr1',
        profileId: 'p1',
        name: 'Project 1',
        url: 'https://p1.com',
      };
      const proj2 = {
        id: 'pr2',
        profileId: 'p2',
        name: 'Project 2',
        url: 'https://p2.com',
      };

      prisma.project.findMany.mockResolvedValue([proj1, proj2]);

      const [p1Projects, p2Projects, p3Projects] = await Promise.all([
        loaders.projectsByProfileIdLoader.load('p1'),
        loaders.projectsByProfileIdLoader.load('p2'),
        loaders.projectsByProfileIdLoader.load('p3'),
      ]);

      expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['p1', 'p2', 'p3'] } },
      });
      expect(p1Projects).toEqual([proj1]);
      expect(p2Projects).toEqual([proj2]);
      expect(p3Projects).toEqual([]);
    });
  });

  describe('profileLinksByProfileIdLoader', () => {
    it('should batch profile IDs into single query via prisma.profileLink.findMany', async () => {
      const link1 = {
        id: 'l1',
        profileId: 'p1',
        platform: 'GitHub',
        url: 'https://github.com/p1',
      };
      const link2 = {
        id: 'l2',
        profileId: 'p1',
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/p1',
      };

      prisma.profileLink.findMany.mockResolvedValue([link1, link2]);

      const [p1Links, p2Links] = await Promise.all([
        loaders.profileLinksByProfileIdLoader.load('p1'),
        loaders.profileLinksByProfileIdLoader.load('p2'),
      ]);

      expect(prisma.profileLink.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.profileLink.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['p1', 'p2'] } },
      });
      expect(p1Links).toEqual([link1, link2]);
      expect(p2Links).toEqual([]);
    });
  });
});
