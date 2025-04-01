
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';

export interface JobFormValues {
  title: string;
  client: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  applicationDeadline: string;
  remoteAllowed: boolean;
  description: string;
}
