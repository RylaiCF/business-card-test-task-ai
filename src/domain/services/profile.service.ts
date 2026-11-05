import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Profile } from '../types';
import { ProfileRepository } from '../../persistence/repositories/profile.repository';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    this.logger.debug('Fetching root profile');
    const profile = await this.profileRepository.findFirst();
    if (!profile) {
      this.logger.warn('Profile not found');
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
