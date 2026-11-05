import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { ProfileService } from '../../domain/services/profile.service';
import {
  Profile,
  ProfileLink,
  Skill,
  Experience,
  Project,
} from '../../domain/types';
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
  async getProfile(): Promise<Profile> {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [ProfileLinkType], {
    name: 'profileLinks',
    description:
      'Resolves external profile links via DataLoader batching (GLOSSARY.md compliant)',
  })
  async getProfileLinks(
    @Parent() profile: Profile,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<ProfileLink[]> {
    return loaders.profileLinksByProfileIdLoader.load(profile.id);
  }

  @ResolveField(() => [SkillType], {
    name: 'skills',
    description: 'Resolves technical skills via DataLoader batching',
  })
  async getSkills(
    @Parent() profile: Profile,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<Skill[]> {
    return loaders.skillsByProfileIdLoader.load(profile.id);
  }

  @ResolveField(() => [ExperienceType], {
    name: 'experience',
    description: 'Resolves work experience history via DataLoader batching',
  })
  async getExperience(
    @Parent() profile: Profile,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<Experience[]> {
    return loaders.experiencesByProfileIdLoader.load(profile.id);
  }

  @ResolveField(() => [ProjectType], {
    name: 'projects',
    description: 'Resolves showcase projects via DataLoader batching',
  })
  async getProjects(
    @Parent() profile: Profile,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<Project[]> {
    return loaders.projectsByProfileIdLoader.load(profile.id);
  }
}
