import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Skill', { description: 'Engineering skill in a technical area' })
export class SkillType {
  @Field(() => String)
  name!: string;
}
