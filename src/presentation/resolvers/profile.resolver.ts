import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { ProfileService } from '../../domain/services/profile.service';
import { ProfileModel } from '../../domain/types';
import { IDataLoaders } from '../../domain/dataloaders';
import {
  ProfileType,
  ProfileLinkType,
  SkillType,
  ExperienceType,
  ProjectType,
} from '../types';

@Resolver(() => ProfileType)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileType, {
    name: 'profile',
    description: "Returns the specialist's profile",
  })
  async getProfile(): Promise<ProfileModel> {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [ProfileLinkType], {
    name: 'profileLinks',
    description:
      'Resolves external profile links via DataLoader batching (GLOSSARY.md compliant)',
  })
  async getProfileLinks(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<ProfileLinkType[]> {
    return loaders.profileLinksByProfileIdLoader.load(
      profile.id,
    ) as unknown as Promise<ProfileLinkType[]>;
  }

  @ResolveField(() => [SkillType], {
    name: 'skills',
    description: 'Resolves technical skills via DataLoader batching',
  })
  async getSkills(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<SkillType[]> {
    return loaders.skillsByProfileIdLoader.load(
      profile.id,
    ) as unknown as Promise<SkillType[]>;
  }

  @ResolveField(() => [ExperienceType], {
    name: 'experience',
    description: 'Resolves work experience history via DataLoader batching',
  })
  async getExperience(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<ExperienceType[]> {
    return loaders.experiencesByProfileIdLoader.load(
      profile.id,
    ) as unknown as Promise<ExperienceType[]>;
  }

  @ResolveField(() => [ProjectType], {
    name: 'projects',
    description: 'Resolves showcase projects via DataLoader batching',
  })
  async getProjects(
    @Parent() profile: ProfileModel,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<ProjectType[]> {
    return loaders.projectsByProfileIdLoader.load(
      profile.id,
    ) as unknown as Promise<ProjectType[]>;
  }
}
