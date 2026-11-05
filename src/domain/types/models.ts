export interface ProfileModel {
  id: string;
  name: string;
  description: string;
}

export interface ProfileLinkModel {
  id: string;
  profileId: string;
  platform: string;
  url: string;
}

export interface ExperienceModel {
  id: string;
  profileId: string;
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
}

export interface AchievementModel {
  id: string;
  experienceId: string;
  description: string;
  order: number;
}

export interface ProjectModel {
  id: string;
  profileId: string;
  name: string;
  url: string | null;
}

export interface SkillModel {
  id: string;
  name: string;
}
