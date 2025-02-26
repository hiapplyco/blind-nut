
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema, JobFormValues } from "../schema";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseJobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
}

export function useJobPostingForm({ jobId, onSuccess }: UseJobPostingFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      content: "",
    }
  });

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;

      try {
        const { data: job, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .maybeSingle();

        if (error) {
          toast({
            title: "Error",
            description: "Failed to fetch job details",
            variant: "destructive",
          });
          return;
        }

        if (job) {
          const jobSummary = `
Title: ${job.title || 'N/A'}
Client: ${job.client_id || 'N/A'}
Location: ${job.location || 'Remote'}
Salary Range: ${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'}
Job Type: ${job.job_type || 'Full-time'}
Experience Level: ${job.experience_level || 'Entry'}
Skills Required: ${Array.isArray(job.skills_required) ? job.skills_required.join(", ") : job.skills_required || 'N/A'}
Application Deadline: ${job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}
Remote Allowed: ${job.remote_allowed ? 'Yes' : 'No'}

Description:
${job.content || ''}`;

          form.reset({
            content: jobSummary.trim()
          });
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to fetch job details",
          variant: "destructive",
        });
      }
    }

    fetchJob();
  }, [jobId, form]);

  async function onSubmit(formData: JobFormValues) {
    try {
      const lines = formData.content.split('\n');
      const processed: any = {
        content: formData.content,
        updated_at: new Date().toISOString()
      };

      // Parse the content to extract structured data
      lines.forEach(line => {
        if (line.startsWith('Title:')) {
          processed.title = line.replace('Title:', '').trim();
        } else if (line.startsWith('Client:')) {
          processed.client_id = line.replace('Client:', '').trim();
        } else if (line.startsWith('Location:')) {
          processed.location = line.replace('Location:', '').trim();
        } else if (line.startsWith('Salary Range:')) {
          const range = line.replace('Salary Range:', '').trim().split('-');
          processed.salary_min = range[0].trim() !== 'N/A' ? Number(range[0]) : null;
          processed.salary_max = range[1].trim() !== 'N/A' ? Number(range[1]) : null;
        } else if (line.startsWith('Job Type:')) {
          processed.job_type = line.replace('Job Type:', '').trim().toLowerCase();
        } else if (line.startsWith('Experience Level:')) {
          processed.experience_level = line.replace('Experience Level:', '').trim().toLowerCase();
        } else if (line.startsWith('Skills Required:')) {
          const skills = line.replace('Skills Required:', '').trim();
          processed.skills_required = skills !== 'N/A' ? skills.split(',').map((s: string) => s.trim()) : [];
        } else if (line.startsWith('Application Deadline:')) {
          const deadline = line.replace('Application Deadline:', '').trim();
          processed.application_deadline = deadline !== 'N/A' ? new Date(deadline).toISOString() : null;
        } else if (line.startsWith('Remote Allowed:')) {
          processed.remote_allowed = line.replace('Remote Allowed:', '').trim() === 'Yes';
        }
      });

      if (jobId) {
        const { error } = await supabase
          .from("jobs")
          .update(processed)
          .eq("id", jobId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(processed);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Job posting created successfully",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job posting",
        variant: "destructive",
      });
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting
  };
}
