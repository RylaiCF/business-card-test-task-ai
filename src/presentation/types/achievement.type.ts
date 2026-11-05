import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Achievement', {
  description: 'Measurable achievement delivered during work experience',
})
export class AchievementType {
  @Field(() => String)
  description!: string;
}
