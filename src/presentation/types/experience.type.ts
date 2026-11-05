import { Field, ObjectType } from '@nestjs/graphql';
import { AchievementType } from './achievement.type';

@ObjectType('Experience', { description: 'Work experience record' })
export class ExperienceType {
  @Field(() => String)
  company!: string;

  @Field(() => String)
  position!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date | null;

  @Field(() => Boolean)
  isCurrent!: boolean;

  @Field(() => [AchievementType], {
    description: 'Achievements delivered during this role',
  })
  achievements!: AchievementType[];
}
