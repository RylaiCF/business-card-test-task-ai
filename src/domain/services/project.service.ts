import { Injectable, Logger } from '@nestjs/common';
import { ProjectModel } from '../types';
import { ProjectRepository } from '../../persistence/repositories/project.repository';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private readonly projectRepository: ProjectRepository) {}

  async getAllProjects(): Promise<ProjectModel[]> {
    this.logger.debug('Fetching all projects');
    return this.projectRepository.findAll();
  }
}
