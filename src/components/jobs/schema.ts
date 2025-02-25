
import * as z from 'zod';

export const jobTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship'] as const;
export type JobType = typeof jobTypes[number];

export const experienceLevels = ['entry', 'mid', 'senior', 'executive'] as const;
export type ExperienceLevel = typeof experienceLevels[number];

export const jobFormSchema = z.object({
  title: z.string().min(1, { message: 'Job title is required' })
    .max(100, { message: 'Job title cannot exceed 100 characters' }),
  client_id: z.string().min(1, { message: 'Please select a client' }),
  description: z.string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(10000, { message: 'Description cannot exceed 10000 characters' }),
  location: z.string().superRefine((val, ctx) => {
    const remote = ctx.path.length > 1 ? 
      (ctx.parent as { remote_allowed: boolean }).remote_allowed : 
      false;
      
    if (!remote && val.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Location is required for non-remote positions',
      });
    }
  }),
  salary_min: z.union([z.string(), z.number(), z.null()])
    .transform((val) => val === '' ? null : val === null ? null : Number(val))
    .refine((val) => val === null || !isNaN(val as number), {
      message: 'Invalid salary value',
    })
    .refine((val) => val === null || (val as number) >= 0, {
      message: 'Minimum salary cannot be negative',
    }),
  salary_max: z.union([z.string(), z.number(), z.null()])
    .transform((val) => val === '' ? null : val === null ? null : Number(val))
    .refine((val) => val === null || !isNaN(val as number), {
      message: 'Invalid salary value',
    })
    .refine((val) => val === null || (val as number) >= 0, {
      message: 'Maximum salary cannot be negative',
    }),
  job_type: z.enum(jobTypes, {
    errorMap: () => ({ message: 'Please select a valid job type' }),
  }),
  experience_level: z.enum(experienceLevels, {
    errorMap: () => ({ message: 'Please select a valid experience level' }),
  }),
  skills_required: z.string(),
  application_deadline: z.date().nullable().refine(
    (date) => {
      if (!date) return true;
      return date > new Date();
    },
    { message: 'Application deadline must be in the future' }
  ),
  remote_allowed: z.boolean().default(false),
  is_active: z.boolean().default(true)
}).refine(
  (data) => {
    if (data.salary_min && data.salary_max) {
      return Number(data.salary_min) <= Number(data.salary_max);
    }
    return true;
  },
  {
    message: "Minimum salary cannot be greater than maximum salary",
    path: ["salary_min"]
  }
);

export type JobFormValues = z.infer<typeof jobFormSchema>;
