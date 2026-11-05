import { Injectable, Logger } from '@nestjs/common';
import { ExperienceModel } from '../types';
import { ExperienceRepository } from '../../persistence/repositories/experience.repository';

@Injectable()
export class ExperienceService {
  private readonly logger = new Logger(ExperienceService.name);

  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async getAllExperiences(): Promise<ExperienceModel[]> {
    this.logger.debug('Fetching all experiences');
    return this.experienceRepository.findAll();
  }
}
