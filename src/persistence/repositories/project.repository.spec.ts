import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRepository } from './project.repository';
import { PrismaService } from '../prisma.service';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let prisma: {
    project: {
      findMany: any;
    };
  };

  const mockProjects = [
    {
      id: 'proj-1',
      profileId: 'profile-1',
      name: 'Vizitka Portfolio',
      url: 'https://vizitka.dev',
    },
  ];

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ProjectRepository>(ProjectRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByProfileIds', () => {
    it('should find projects by profileIds', async () => {
      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await repository.findByProfileIds(['profile-1']);

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          profileId: { in: ['profile-1'] },
        },
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('findAll', () => {
    it('should find all projects', async () => {
      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await repository.findAll();

      expect(prisma.project.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });
  });
});
