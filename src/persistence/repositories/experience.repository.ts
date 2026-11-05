import { Injectable } from '@nestjs/common';
import { Experience } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: string[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: {
        profileId: { in: profileIds },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findAll(): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}
