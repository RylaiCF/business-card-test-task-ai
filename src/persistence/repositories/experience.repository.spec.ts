import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceRepository } from './experience.repository';
import { PrismaService } from '../prisma.service';

describe('ExperienceRepository', () => {
  let repository: ExperienceRepository;
  let prisma: {
    experience: {
      findMany: any;
    };
  };

  const mockExperiences = [
    {
      id: 'exp-1',
      profileId: 'profile-1',
      company: 'Tech Corp',
      position: 'Staff Engineer',
      startDate: new Date('2024-01-01'),
      endDate: null,
      isCurrent: true,
    },
    {
      id: 'exp-2',
      profileId: 'profile-1',
      company: 'Startup Inc',
      position: 'Senior Engineer',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2023-12-31'),
      isCurrent: false,
    },
  ];

  beforeEach(async () => {
    prisma = {
      experience: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ExperienceRepository>(ExperienceRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByProfileIds', () => {
    it('should find experiences by profileIds ordered by startDate desc', async () => {
      prisma.experience.findMany.mockResolvedValue(mockExperiences);

      const result = await repository.findByProfileIds(['profile-1']);

      expect(prisma.experience.findMany).toHaveBeenCalledWith({
        where: {
          profileId: { in: ['profile-1'] },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      expect(result).toEqual(mockExperiences);
    });
  });

  describe('findAll', () => {
    it('should find all experiences ordered by startDate desc', async () => {
      prisma.experience.findMany.mockResolvedValue(mockExperiences);

      const result = await repository.findAll();

      expect(prisma.experience.findMany).toHaveBeenCalledWith({
        orderBy: {
          startDate: 'desc',
        },
      });
      expect(result).toEqual(mockExperiences);
    });
  });
});
