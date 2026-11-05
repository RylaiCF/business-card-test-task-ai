import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { ProfileResolver, ExperienceResolver } from './resolvers';

@Module({
  imports: [DomainModule],
  providers: [ProfileResolver, ExperienceResolver],
  exports: [ProfileResolver, ExperienceResolver],
})
export class PresentationModule {}
