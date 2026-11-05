import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { Experience, Achievement } from '../../domain/types';
import { IDataLoaders } from '../../domain/dataloaders';
import { ExperienceType, AchievementType } from '../types';

@Resolver(() => ExperienceType)
export class ExperienceResolver {
  @ResolveField(() => [AchievementType], {
    name: 'achievements',
    description: 'Resolves achievements delivered during this role',
  })
  async getAchievements(
    @Parent() experience: Experience,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<Achievement[]> {
    return loaders.achievementsByExperienceIdLoader.load(experience.id);
  }
}
