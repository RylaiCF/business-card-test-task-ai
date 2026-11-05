import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  ProfileRepository,
  ExperienceRepository,
  AchievementRepository,
  ProjectRepository,
  SkillRepository,
  ProfileLinkRepository,
} from './repositories';

const repositories = [
  ProfileRepository,
  ExperienceRepository,
  AchievementRepository,
  ProjectRepository,
  SkillRepository,
  ProfileLinkRepository,
];

@Module({
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class PersistenceModule {}
