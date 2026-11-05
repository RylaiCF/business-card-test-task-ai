import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ProfileService } from './services';
import { DataLoaderFactory } from './dataloaders';

const services = [
  ProfileService,
  DataLoaderFactory,
];

@Module({
  imports: [PersistenceModule],
  providers: [...services],
  exports: [...services],
})
export class DomainModule {}
