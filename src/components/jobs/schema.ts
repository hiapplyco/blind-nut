
import * as z from 'zod';

export const jobFormSchema = z.object({
  title: z.string().min(1, { message: 'Job title is required' }),
  client_id: z.string().min(1, { message: 'Client is required' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  location: z.string().min(1, { message: 'Location is required' }),
  salary_min: z.string(),
  salary_max: z.string(),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'temporary', 'internship']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'executive']),
  skills_required: z.string(),
  application_deadline: z.date().nullable(),
  remote_allowed: z.boolean().default(false),
  is_active: z.boolean().default(true)
}).refine(data => {
  if (data.salary_min && data.salary_max) {
    return Number(data.salary_min) <= Number(data.salary_max);
  }
  return true;
}, {
  message: "Minimum salary cannot be greater than maximum salary",
  path: ["salary_min"]
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
