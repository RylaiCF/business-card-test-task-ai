import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceService } from './experience.service';
import { ExperienceRepository } from '../../persistence/repositories/experience.repository';

describe('ExperienceService', () => {
  let service: ExperienceService;
  let experienceRepository: {
    findAll: any;
    findByProfileId: any;
  };

  const mockExperiences = [
    {
      id: 'exp-1',
      profileId: 'profile-1',
      company: 'Tech Corp',
      position: 'Staff Engineer',
      startDate: new Date('2023-01-01'),
      endDate: null,
      isCurrent: true,
    },
    {
      id: 'exp-2',
      profileId: 'profile-1',
      company: 'Startup Inc',
      position: 'Senior Backend Engineer',
      startDate: new Date('2021-01-01'),
      endDate: new Date('2022-12-31'),
      isCurrent: false,
    },
  ];

  beforeEach(async () => {
    experienceRepository = {
      findAll: vi.fn(),
      findByProfileId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        {
          provide: ExperienceRepository,
          useValue: experienceRepository,
        },
      ],
    }).compile();

    service = module.get<ExperienceService>(ExperienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllExperiences', () => {
    it('should return all experiences', async () => {
      experienceRepository.findAll.mockResolvedValue(mockExperiences);

      const result = await service.getAllExperiences();

      expect(experienceRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockExperiences);
    });

    it('should return empty array when no experiences exist', async () => {
      experienceRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllExperiences();

      expect(experienceRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});
