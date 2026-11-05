import { Injectable } from '@nestjs/common';
import { Skill } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export interface ProfileSkillWithSkill extends Skill {
  profileId: string;
}

@Injectable()
export class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(
    profileIds: string[],
  ): Promise<ProfileSkillWithSkill[]> {
    const profileSkills = await this.prisma.profileSkill.findMany({
      where: {
        profileId: { in: profileIds },
      },
      include: {
        skill: true,
      },
    });

    return profileSkills.map((ps) => ({
      ...ps.skill,
      profileId: ps.profileId,
    }));
  }

  async findAll(): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
