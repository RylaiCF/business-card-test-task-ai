import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProfileRepository } from './repositories';

@Module({
  providers: [PrismaService, ProfileRepository],
  exports: [PrismaService, ProfileRepository],
})
export class PersistenceModule {}
