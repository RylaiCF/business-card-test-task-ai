import { Test, TestingModule } from '@nestjs/testing';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from '../../domain/services/profile.service';
import { IDataLoaders } from '../../domain/dataloaders';

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;
  let profileService: Partial<ProfileService>;
  let mockLoaders: Partial<IDataLoaders>;

  const mockProfile = {
    id: 'p-1',
    name: 'Kirill Gorbunov',
    description: 'Expert backend developer',
  };

  beforeEach(async () => {
    profileService = {
      getProfile: vi.fn().mockResolvedValue(mockProfile),
    };

    const linkLoader = {
      load: vi.fn().mockResolvedValue([
        {
          platform: 'GitHub',
          url: 'https://github.com',
        },
      ]),
    };

    mockLoaders = {
      profileLinksByProfileIdLoader: linkLoader as any,
      skillsByProfileIdLoader: {
        load: vi.fn().mockResolvedValue([{ name: 'TypeScript' }]),
      } as any,
      experiencesByProfileIdLoader: {
        load: vi.fn().mockResolvedValue([
          {
            company: 'Tech Corp',
            position: 'Lead',
            startDate: new Date(),
            endDate: null,
            isCurrent: true,
          },
        ]),
      } as any,
      projectsByProfileIdLoader: {
        load: vi.fn().mockResolvedValue([
          {
            name: 'Vizitka',
            url: null,
          },
        ]),
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
        mockProfile as any,
        mockLoaders as IDataLoaders,
      );
      expect(
        mockLoaders.profileLinksByProfileIdLoader!.load,
      ).toHaveBeenCalledWith('p-1');
      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe('GitHub');
    });

    it('should batch skills via skillsByProfileIdLoader', async () => {
      const result = await resolver.getSkills(
        mockProfile as any,
        mockLoaders as IDataLoaders,
      );
      expect(mockLoaders.skillsByProfileIdLoader!.load).toHaveBeenCalledWith(
        'p-1',
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('TypeScript');
    });

    it('should batch experience via experiencesByProfileIdLoader', async () => {
      const result = await resolver.getExperience(
        mockProfile as any,
        mockLoaders as IDataLoaders,
      );
      expect(
        mockLoaders.experiencesByProfileIdLoader!.load,
      ).toHaveBeenCalledWith('p-1');
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Tech Corp');
    });

    it('should batch projects via projectsByProfileIdLoader', async () => {
      const result = await resolver.getProjects(
        mockProfile as any,
        mockLoaders as IDataLoaders,
      );
      expect(mockLoaders.projectsByProfileIdLoader!.load).toHaveBeenCalledWith(
        'p-1',
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Vizitka');
    });
  });
});
