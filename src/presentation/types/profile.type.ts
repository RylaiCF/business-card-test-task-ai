import { Field, ObjectType } from '@nestjs/graphql';
import { ProfileLinkType } from './profile-link.type';
import { SkillType } from './skill.type';
import { ExperienceType } from './experience.type';
import { ProjectType } from './project.type';

@ObjectType('Profile', {
  description: 'The specialist professional profile aggregate',
})
export class ProfileType {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;

  @Field(() => [ProfileLinkType], {
    description: 'External references and profile links',
  })
  profileLinks!: ProfileLinkType[];

  @Field(() => [SkillType], {
    description: 'Technical skills',
  })
  skills!: SkillType[];

  @Field(() => [ExperienceType], {
    description: 'Work experience records',
  })
  experience!: ExperienceType[];

  @Field(() => [ProjectType], {
    description: 'Showcase projects',
  })
  projects!: ProjectType[];
}
