import { Injectable } from '@nestjs/common';
import { ProfileLink } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfileLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: string[]): Promise<ProfileLink[]> {
    return this.prisma.profileLink.findMany({
      where: {
        profileId: { in: profileIds },
      },
    });
  }
}
