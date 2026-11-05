import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ProfileLink', {
  description: 'External profile link or reference',
})
export class ProfileLinkType {
  @Field(() => String)
  platform!: string;

  @Field(() => String)
  url!: string;
}
