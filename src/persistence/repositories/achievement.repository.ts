import { Injectable } from '@nestjs/common';
import { Achievement } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByExperienceIds(experienceIds: string[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: {
        experienceId: { in: experienceIds },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}
