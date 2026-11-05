import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from '../../persistence/repositories/project.repository';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: {
    findAll: any;
    findByProfileId: any;
  };

  const mockProjects = [
    {
      id: 'proj-1',
      profileId: 'profile-1',
      name: 'Project Alpha',
      url: 'https://alpha.example.com',
    },
    {
      id: 'proj-2',
      profileId: 'profile-1',
      name: 'Project Beta',
      url: 'https://beta.example.com',
    },
  ];

  beforeEach(async () => {
    projectRepository = {
      findAll: vi.fn(),
      findByProfileId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: projectRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      projectRepository.findAll.mockResolvedValue(mockProjects);

      const result = await service.getAllProjects();

      expect(projectRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no projects exist', async () => {
      projectRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllProjects();

      expect(projectRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});
