import { Test, TestingModule } from '@nestjs/testing';
import { ProfileRepository } from './profile.repository';
import { PrismaService } from '../prisma.service';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let prisma: {
    profile: {
      findFirst: any;
    };
  };

  const mockProfile = {
    id: 'profile-1',
    name: 'Kirill Gorbunov',
    description: 'Specialist bio',
  };

  beforeEach(async () => {
    prisma = {
      profile: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findFirst', () => {
    it('should return the first profile found', async () => {
      prisma.profile.findFirst.mockResolvedValue(mockProfile);

      const result = await repository.findFirst();

      expect(prisma.profile.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProfile);
    });

    it('should return null when no profile exists', async () => {
      prisma.profile.findFirst.mockResolvedValue(null);

      const result = await repository.findFirst();

      expect(prisma.profile.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
});
