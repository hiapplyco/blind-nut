import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { jobFormSchema, type JobFormValues } from "./schema";
import { format } from "date-fns";

interface JobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
}

export function JobPostingForm({ jobId, onSuccess }: JobPostingFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      client_id: "",
      description: "",
      location: "",
      salary_min: "",
      salary_max: "",
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
        // Transform the data to match the form's expected format
        const formData = {
          ...job,
          salary_min: job.salary_min?.toString() ?? "",
          salary_max: job.salary_max?.toString() ?? "",
          application_deadline: job.application_deadline ? new Date(job.application_deadline) : null,
          skills_required: job.skills_required?.join(", ") ?? ""
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
        // salary fields are already transformed by Zod schema
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Job Title</Form.Label>
              <Form.Control>
                <Input placeholder="Job Title" {...form.register("title")} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>

          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Client</Form.Label>
              <Form.Control>
                <Input placeholder="Client" {...form.register("client_id")} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>
        </div>

        <div className="space-y-2">
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea
                placeholder="Job description"
                {...form.register("description")}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Location</Form.Label>
              <Form.Control>
                <Input placeholder="Location" {...form.register("location")} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>

          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Salary Range</Form.Label>
              <div className="grid grid-cols-2 gap-2">
                <Form.Control>
                  <Input type="number" placeholder="Min" {...form.register("salary_min")} />
                </Form.Control>
                <Form.Control>
                  <Input type="number" placeholder="Max" {...form.register("salary_max")} />
                </Form.Control>
              </div>
              <Form.Message />
            </Form.Item>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Job Type</Form.Label>
              <Form.Control>
                <Select onValueChange={form.setValue("job_type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>

          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Experience Level</Form.Label>
              <Form.Control>
                <Select onValueChange={form.setValue("experience_level")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>
        </div>

        <div className="space-y-2">
          <Form.Item>
            <Form.Label>Skills Required</Form.Label>
            <Form.Control>
              <Input
                placeholder="e.g., React, Node.js, TypeScript"
                {...form.register("skills_required")}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Form.Item>
              <Form.Label>Application Deadline</Form.Label>
              <Form.Control>
                <Input
                  type="date"
                  {...form.register("application_deadline", {
                    valueAsDate: true,
                  })}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          </div>

          <div className="space-y-2 flex items-center">
            <Form.Item className="flex flex-row items-center space-x-2 space-y-0">
              <Form.Control>
                <Checkbox
                  defaultChecked={false}
                  onCheckedChange={form.setValue("remote_allowed")}
                />
              </Form.Control>
              <Form.Label>Remote Allowed</Form.Label>
            </Form.Item>
          </div>
        </div>

        <div className="space-y-2 flex items-center">
          <Form.Item className="flex flex-row items-center space-x-2 space-y-0">
            <Form.Control>
              <Checkbox
                defaultChecked={true}
                onCheckedChange={form.setValue("is_active")}
              />
            </Form.Control>
            <Form.Label>Is Active</Form.Label>
          </Form.Item>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
