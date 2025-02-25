
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
          // Convert salary values from Supabase to numbers explicitly
          const salaryMin = job.salary_min ? Number(job.salary_min) : null;
          const salaryMax = job.salary_max ? Number(job.salary_max) : null;

          // Type assertion to ensure TypeScript knows these are numbers
          const formData: JobFormValues = {
            ...job,
            salary_min: salaryMin as number | null,
            salary_max: salaryMax as number | null,
            application_deadline: job.application_deadline ? new Date(job.application_deadline) : null,
            skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(", ") : "",
            job_type: job.job_type as JobFormValues['job_type'] ?? "full-time",
            experience_level: job.experience_level as JobFormValues['experience_level'] ?? "entry"
          };

          form.reset(formData);
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
      form.clearErrors();
      
      // Ensure salary values are numbers for Supabase
      const processedData = {
        ...formData,
        skills_required: formData.skills_required ? formData.skills_required.split(",").map(skill => skill.trim()) : [],
        application_deadline: formData.application_deadline ? formData.application_deadline.toISOString() : null,
        // Explicitly convert salary values to numbers
        salary_min: formData.salary_min !== null ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max !== null ? Number(formData.salary_max) : null,
        updated_at: new Date().toISOString()
      };

      if (jobId) {
        const { error } = await supabase
          .from("jobs")
          .update(processedData)
          .eq("id", jobId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(processedData);

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
