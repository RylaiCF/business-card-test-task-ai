import { Test, TestingModule } from '@nestjs/testing';
import { SkillService } from './skill.service';
import { SkillRepository } from '../../persistence/repositories/skill.repository';

describe('SkillService', () => {
  let service: SkillService;
  let skillRepository: {
    findAll: any;
  };

  const mockSkills = [
    {
      id: 'skill-1',
      name: 'TypeScript',
    },
    {
      id: 'skill-2',
      name: 'PostgreSQL',
    },
  ];

  beforeEach(async () => {
    skillRepository = {
      findAll: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: SkillRepository,
          useValue: skillRepository,
        },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSkills', () => {
    it('should return all skills', async () => {
      skillRepository.findAll.mockResolvedValue(mockSkills);

      const result = await service.getSkills();

      expect(skillRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockSkills);
    });
  });
});
