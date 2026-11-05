import { Test, TestingModule } from '@nestjs/testing';
import { AchievementRepository } from './achievement.repository';
import { PrismaService } from '../prisma.service';

describe('AchievementRepository', () => {
  let repository: AchievementRepository;
  let prisma: {
    achievement: {
      findMany: any;
    };
  };

  const mockAchievements = [
    {
      id: 'ach-1',
      experienceId: 'exp-1',
      description: 'Built distributed caching system improving latency by 40%',
      order: 1,
    },
    {
      id: 'ach-2',
      experienceId: 'exp-1',
      description:
        'Led cross-functional team of 6 engineers for microservice migration',
      order: 2,
    },
  ];

  beforeEach(async () => {
    prisma = {
      achievement: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<AchievementRepository>(AchievementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByExperienceIds', () => {
    it('should find achievements by experienceIds ordered by order asc', async () => {
      prisma.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await repository.findByExperienceIds(['exp-1']);

      expect(prisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          experienceId: { in: ['exp-1'] },
        },
        orderBy: {
          order: 'asc',
        },
      });
      expect(result).toEqual(mockAchievements);
    });
  });
});
