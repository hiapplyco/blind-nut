
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema, JobFormValues } from "../schema";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseJobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
}

export function useJobPostingForm({ jobId, onSuccess }: UseJobPostingFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      client_id: "",
      description: "",
      location: "",
      salary_min: null,
      salary_max: null,
      job_type: "full-time",
      experience_level: "entry",
      skills_required: "",
      application_deadline: null,
      remote_allowed: false,
      is_active: true
    }
  });

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;

      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        return;
      }

      if (job) {
        const salary_min = typeof job.salary_min === 'string' ? 
          parseFloat(job.salary_min) : 
          typeof job.salary_min === 'number' ? 
            job.salary_min : null;
            
        const salary_max = typeof job.salary_max === 'string' ? 
          parseFloat(job.salary_max) : 
          typeof job.salary_max === 'number' ? 
            job.salary_max : null;

        const formData = {
          ...job,
          salary_min,
          salary_max,
          application_deadline: job.application_deadline ? new Date(job.application_deadline) : null,
          skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(", ") : "",
          job_type: job.job_type as JobFormValues['job_type'] ?? "full-time",
          experience_level: job.experience_level as JobFormValues['experience_level'] ?? "entry"
        };
        
        form.reset(formData);
      }
    }

    fetchJob();
  }, [jobId, form]);

  async function onSubmit(data: JobFormValues) {
    try {
      const formattedData = {
        ...data,
        skills_required: data.skills_required ? data.skills_required.split(",").map(skill => skill.trim()) : [],
        application_deadline: data.application_deadline ? data.application_deadline.toISOString() : null,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        updated_at: new Date().toISOString()
      };

      if (jobId) {
        const { error } = await supabase
          .from("jobs")
          .update(formattedData)
          .eq("id", jobId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(formattedData);

        if (error) throw error;
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
