import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import {
  ProfileService,
  ExperienceService,
  ProjectService,
  SkillService,
} from './services';
import { DataLoaderFactory } from './dataloaders';

const services = [
  ProfileService,
  ExperienceService,
  ProjectService,
  SkillService,
  DataLoaderFactory,
];

@Module({
  imports: [PersistenceModule],
  providers: [...services],
  exports: [...services],
})
export class DomainModule {}
