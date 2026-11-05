import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceResolver } from './experience.resolver';
import { IDataLoaders } from '../../domain/dataloaders';
import { Experience, Achievement } from '../../domain/types';

describe('ExperienceResolver', () => {
  let resolver: ExperienceResolver;
  let mockLoaders: Partial<IDataLoaders>;

  const mockExperiences: Experience[] = [
    {
      id: 'e-1',
      profileId: 'p-1',
      company: 'HighTech Inc',
      position: 'Senior Architect',
      startDate: new Date('2023-01-01'),
      endDate: null,
      isCurrent: true,
    },
  ];

  const mockAchievements: Achievement[] = [
    {
      id: 'a-1',
      experienceId: 'e-1',
      description: 'Reduced API latency by 45% using DataLoader',
      order: 1,
    },
  ];

  beforeEach(async () => {
    mockLoaders = {
      achievementsByExperienceIdLoader: {
        load: vi.fn().mockResolvedValue(mockAchievements),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExperienceResolver],
    }).compile();

    resolver = module.get<ExperienceResolver>(ExperienceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('achievements field resolver', () => {
    it('should batch achievements via achievementsByExperienceIdLoader', async () => {
      const result = await resolver.getAchievements(
        mockExperiences[0],
        mockLoaders as IDataLoaders,
      );
      expect(
        mockLoaders.achievementsByExperienceIdLoader!.load,
      ).toHaveBeenCalledWith('e-1');
      expect(result).toEqual(mockAchievements);
    });
  });
});
