import { Test, TestingModule } from '@nestjs/testing';
import { SkillRepository } from './skill.repository';
import { PrismaService } from '../prisma.service';

describe('SkillRepository', () => {
  let repository: SkillRepository;
  let prisma: {
    skill: {
      findMany: any;
    };
    profileSkill: {
      findMany: any;
    };
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

  const mockProfileSkills = [
    {
      profileId: 'profile-1',
      skillId: 'skill-1',
      skill: mockSkills[0],
    },
    {
      profileId: 'profile-1',
      skillId: 'skill-2',
      skill: mockSkills[1],
    },
  ];

  beforeEach(async () => {
    prisma = {
      skill: {
        findMany: vi.fn(),
      },
      profileSkill: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<SkillRepository>(SkillRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByProfileIds', () => {
    it('should find skills by profileIds via profileSkill relation', async () => {
      prisma.profileSkill.findMany.mockResolvedValue(mockProfileSkills);

      const result = await repository.findByProfileIds(['profile-1']);

      expect(prisma.profileSkill.findMany).toHaveBeenCalledWith({
        where: {
          profileId: { in: ['profile-1'] },
        },
        include: {
          skill: true,
        },
      });
      expect(result).toEqual([
        { ...mockSkills[0], profileId: 'profile-1' },
        { ...mockSkills[1], profileId: 'profile-1' },
      ]);
    });
  });

  describe('findAll', () => {
    it('should find all skills ordered by name asc', async () => {
      prisma.skill.findMany.mockResolvedValue(mockSkills);

      const result = await repository.findAll();

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(mockSkills);
    });
  });
});
