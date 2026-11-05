import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { ExperienceModel } from '../../domain/types';
import { IDataLoaders } from '../../domain/dataloaders';
import { ExperienceType, AchievementType } from '../types';

@Resolver(() => ExperienceType)
export class ExperienceResolver {
  @ResolveField(() => [AchievementType], {
    name: 'achievements',
    description: 'Resolves achievements delivered during this role',
  })
  async getAchievements(
    @Parent() experience: ExperienceModel,
    @Context('loaders') loaders: IDataLoaders,
  ): Promise<AchievementType[]> {
    return loaders.achievementsByExperienceIdLoader.load(
      experience.id,
    ) as unknown as Promise<AchievementType[]>;
  }
}
