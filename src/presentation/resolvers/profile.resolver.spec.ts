import { Test, TestingModule } from '@nestjs/testing';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from '../../domain/services/profile.service';
import { IDataLoaders } from '../../domain/dataloaders';
import {
  Profile,
  ProfileLink,
  Skill,
  Experience,
  Project,
} from '../../domain/types';

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;
  let profileService: Partial<ProfileService>;
  let mockLoaders: Partial<IDataLoaders>;

  const mockProfile: Profile = {
    id: 'p-1',
    name: 'Kirill Gorbunov',
    description: 'Expert backend developer',
  };

  const mockProfileLinks: ProfileLink[] = [
    {
      id: 'pl-1',
      profileId: 'p-1',
      platform: 'GitHub',
      url: 'https://github.com',
    },
  ];

  const mockSkills: Skill[] = [
    {
      id: 's-1',
      name: 'TypeScript',
    },
  ];

  const mockExperiences: Experience[] = [
    {
      id: 'e-1',
      profileId: 'p-1',
      company: 'Tech Corp',
      position: 'Lead',
      startDate: new Date(),
      endDate: null,
      isCurrent: true,
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'pr-1',
      profileId: 'p-1',
      name: 'Vizitka',
      url: null,
    },
  ];

  beforeEach(async () => {
    profileService = {
      getProfile: vi.fn().mockResolvedValue(mockProfile),
    };

    mockLoaders = {
      profileLinksByProfileIdLoader: {
        load: vi.fn().mockResolvedValue(mockProfileLinks),
      } as any,
      skillsByProfileIdLoader: {
        load: vi.fn().mockResolvedValue(mockSkills),
      } as any,
      experiencesByProfileIdLoader: {
        load: vi.fn().mockResolvedValue(mockExperiences),
      } as any,
      projectsByProfileIdLoader: {
        load: vi.fn().mockResolvedValue(mockProjects),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        { provide: ProfileService, useValue: profileService },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getProfile query', () => {
    it('should delegate to profileService.getProfile', async () => {
      const result = await resolver.getProfile();
      expect(profileService.getProfile).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });
  });

  describe('field resolvers via DataLoaders', () => {
    it('should batch profileLinks via profileLinksByProfileIdLoader', async () => {
      const result = await resolver.getProfileLinks(
        mockProfile,
        mockLoaders as IDataLoaders,
      );
      expect(
        mockLoaders.profileLinksByProfileIdLoader!.load,
      ).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(mockProfileLinks);
    });

    it('should batch skills via skillsByProfileIdLoader', async () => {
      const result = await resolver.getSkills(
        mockProfile,
        mockLoaders as IDataLoaders,
      );
      expect(mockLoaders.skillsByProfileIdLoader!.load).toHaveBeenCalledWith(
        'p-1',
      );
      expect(result).toEqual(mockSkills);
    });

    it('should batch experience via experiencesByProfileIdLoader', async () => {
      const result = await resolver.getExperience(
        mockProfile,
        mockLoaders as IDataLoaders,
      );
      expect(
        mockLoaders.experiencesByProfileIdLoader!.load,
      ).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(mockExperiences);
    });

    it('should batch projects via projectsByProfileIdLoader', async () => {
      const result = await resolver.getProjects(
        mockProfile,
        mockLoaders as IDataLoaders,
      );
      expect(mockLoaders.projectsByProfileIdLoader!.load).toHaveBeenCalledWith(
        'p-1',
      );
      expect(result).toEqual(mockProjects);
    });
  });
});
