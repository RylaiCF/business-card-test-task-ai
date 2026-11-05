import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileRepository } from '../../persistence/repositories/profile.repository';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: {
    findFirst: any;
    findById: any;
  };

  const mockProfile = {
    id: 'profile-1',
    name: 'Kirill Gorbunov',
    description: 'Specialist bio',
  };

  beforeEach(async () => {
    profileRepository = {
      findFirst: vi.fn(),
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: profileRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the specialist profile when found', async () => {
      profileRepository.findFirst.mockResolvedValue(mockProfile);

      const result = await service.getProfile();

      expect(profileRepository.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      profileRepository.findFirst.mockResolvedValue(null);

      await expect(service.getProfile()).rejects.toThrow(
        new NotFoundException('Profile not found'),
      );
      expect(profileRepository.findFirst).toHaveBeenCalledTimes(1);
    });
  });
});
