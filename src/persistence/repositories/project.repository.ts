import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: string[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        profileId: { in: profileIds },
      },
    });
  }

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany();
  }
}
