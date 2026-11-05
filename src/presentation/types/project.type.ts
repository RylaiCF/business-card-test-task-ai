import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Project', {
  description: 'Showcase project highlighting practical applications',
})
export class ProjectType {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  url?: string | null;
}
