import { Test, TestingModule } from '@nestjs/testing';
import { ProfileLinkRepository } from './profile-link.repository';
import { PrismaService } from '../prisma.service';

describe('ProfileLinkRepository', () => {
  let repository: ProfileLinkRepository;
  let prisma: {
    profileLink: {
      findMany: any;
    };
  };

  const mockLinks = [
    {
      id: 'link-1',
      profileId: 'profile-1',
      platform: 'GitHub',
      url: 'https://github.com/kgorbunov',
    },
    {
      id: 'link-2',
      profileId: 'profile-1',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/kgorbunov',
    },
  ];

  beforeEach(async () => {
    prisma = {
      profileLink: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileLinkRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ProfileLinkRepository>(ProfileLinkRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByProfileIds', () => {
    it('should find links by profileIds', async () => {
      prisma.profileLink.findMany.mockResolvedValue(mockLinks);

      const result = await repository.findByProfileIds(['profile-1']);

      expect(prisma.profileLink.findMany).toHaveBeenCalledWith({
        where: {
          profileId: { in: ['profile-1'] },
        },
      });
      expect(result).toEqual(mockLinks);
    });
  });
});
