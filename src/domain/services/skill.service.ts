import { Injectable, Logger } from '@nestjs/common';
import { SkillModel } from '../types';
import { SkillRepository } from '../../persistence/repositories/skill.repository';

@Injectable()
export class SkillService {
  private readonly logger = new Logger(SkillService.name);

  constructor(private readonly skillRepository: SkillRepository) {}

  async getSkills(): Promise<SkillModel[]> {
    this.logger.debug('Fetching skills');
    return this.skillRepository.findAll();
  }
}
