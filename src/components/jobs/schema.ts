
import * as z from 'zod';

export const jobTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship'] as const;
export type JobType = typeof jobTypes[number];

export const experienceLevels = ['entry', 'mid', 'senior', 'executive'] as const;
export type ExperienceLevel = typeof experienceLevels[number];

export const jobFormSchema = z.object({
  content: z.string()
    .min(20, { message: 'Content must be at least 20 characters' })
    .max(10000, { message: 'Content cannot exceed 10000 characters' })
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

