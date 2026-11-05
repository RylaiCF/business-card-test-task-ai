import {
  DataLoaderFactory,
  groupByForeignKey,
  IDataLoaders,
} from './dataloader.factory';
import {
  SkillRepository,
  ExperienceRepository,
  AchievementRepository,
  ProjectRepository,
  ProfileLinkRepository,
} from '../../persistence/repositories';

describe('DataLoaderFactory & Batching Mechanics', () => {
  let factory: DataLoaderFactory;
  let loaders: IDataLoaders;

  let skillRepository: { findByProfileIds: any };
  let experienceRepository: { findByProfileIds: any };
  let achievementRepository: { findByExperienceIds: any };
  let projectRepository: { findByProfileIds: any };
  let profileLinkRepository: { findByProfileIds: any };

  beforeEach(() => {
    skillRepository = { findByProfileIds: vi.fn() };
    experienceRepository = { findByProfileIds: vi.fn() };
    achievementRepository = { findByExperienceIds: vi.fn() };
    projectRepository = { findByProfileIds: vi.fn() };
    profileLinkRepository = { findByProfileIds: vi.fn() };

    factory = new DataLoaderFactory(
      skillRepository as unknown as SkillRepository,
      experienceRepository as unknown as ExperienceRepository,
      achievementRepository as unknown as AchievementRepository,
      projectRepository as unknown as ProjectRepository,
      profileLinkRepository as unknown as ProfileLinkRepository,
    );

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
  });

  describe('skillsByProfileIdLoader', () => {
    it('should batch multiple profile IDs into a single query via SkillRepository', async () => {
      const skill1 = {
        id: 's1',
        name: 'TypeScript',
        profileId: 'p1',
      };
      const skill2 = {
        id: 's2',
        name: 'PostgreSQL',
        profileId: 'p1',
      };
      const skill3 = {
        id: 's3',
        name: 'Docker',
        profileId: 'p2',
      };

      skillRepository.findByProfileIds.mockResolvedValue([
        skill3,
        skill1,
        skill2,
      ]);

      const [p1Skills, p2Skills, p3Skills] = await Promise.all([
        loaders.skillsByProfileIdLoader.load('p1'),
        loaders.skillsByProfileIdLoader.load('p2'),
        loaders.skillsByProfileIdLoader.load('p3'),
      ]);

      expect(skillRepository.findByProfileIds).toHaveBeenCalledTimes(1);
      expect(skillRepository.findByProfileIds).toHaveBeenCalledWith([
        'p1',
        'p2',
        'p3',
      ]);

      expect(p1Skills).toEqual([skill1, skill2]);
      expect(p2Skills).toEqual([skill3]);
      expect(p3Skills).toEqual([]);
    });
  });

  describe('experiencesByProfileIdLoader', () => {
    it('should batch profile IDs into single query via ExperienceRepository', async () => {
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

      experienceRepository.findByProfileIds.mockResolvedValue([exp1, exp2]);

      const [p1Exp, p2Exp, p3Exp] = await Promise.all([
        loaders.experiencesByProfileIdLoader.load('p1'),
        loaders.experiencesByProfileIdLoader.load('p2'),
        loaders.experiencesByProfileIdLoader.load('p3'),
      ]);

      expect(experienceRepository.findByProfileIds).toHaveBeenCalledTimes(1);
      expect(experienceRepository.findByProfileIds).toHaveBeenCalledWith([
        'p1',
        'p2',
        'p3',
      ]);
      expect(p1Exp).toEqual([exp1]);
      expect(p2Exp).toEqual([exp2]);
      expect(p3Exp).toEqual([]);
    });
  });

  describe('achievementsByExperienceIdLoader', () => {
    it('should batch experience IDs into single query via AchievementRepository', async () => {
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

      achievementRepository.findByExperienceIds.mockResolvedValue([a3, a1, a2]);

      const [e1Ach, e2Ach, e3Ach] = await Promise.all([
        loaders.achievementsByExperienceIdLoader.load('e1'),
        loaders.achievementsByExperienceIdLoader.load('e2'),
        loaders.achievementsByExperienceIdLoader.load('e3'),
      ]);

      expect(achievementRepository.findByExperienceIds).toHaveBeenCalledTimes(
        1,
      );
      expect(achievementRepository.findByExperienceIds).toHaveBeenCalledWith([
        'e1',
        'e2',
        'e3',
      ]);
      expect(e1Ach).toEqual([a1, a2]);
      expect(e2Ach).toEqual([a3]);
      expect(e3Ach).toEqual([]);
    });
  });

  describe('projectsByProfileIdLoader', () => {
    it('should batch profile IDs into single query via ProjectRepository', async () => {
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

      projectRepository.findByProfileIds.mockResolvedValue([proj1, proj2]);

      const [p1Projects, p2Projects, p3Projects] = await Promise.all([
        loaders.projectsByProfileIdLoader.load('p1'),
        loaders.projectsByProfileIdLoader.load('p2'),
        loaders.projectsByProfileIdLoader.load('p3'),
      ]);

      expect(projectRepository.findByProfileIds).toHaveBeenCalledTimes(1);
      expect(projectRepository.findByProfileIds).toHaveBeenCalledWith([
        'p1',
        'p2',
        'p3',
      ]);
      expect(p1Projects).toEqual([proj1]);
      expect(p2Projects).toEqual([proj2]);
      expect(p3Projects).toEqual([]);
    });
  });

  describe('profileLinksByProfileIdLoader', () => {
    it('should batch profile IDs into single query via ProfileLinkRepository', async () => {
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

      profileLinkRepository.findByProfileIds.mockResolvedValue([link1, link2]);

      const [p1Links, p2Links] = await Promise.all([
        loaders.profileLinksByProfileIdLoader.load('p1'),
        loaders.profileLinksByProfileIdLoader.load('p2'),
      ]);

      expect(profileLinkRepository.findByProfileIds).toHaveBeenCalledTimes(1);
      expect(profileLinkRepository.findByProfileIds).toHaveBeenCalledWith([
        'p1',
        'p2',
      ]);
      expect(p1Links).toEqual([link1, link2]);
      expect(p2Links).toEqual([]);
    });
  });
});
