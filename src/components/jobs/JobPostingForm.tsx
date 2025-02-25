
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicInfoFields } from "./form-fields/BasicInfoFields";
import { LocationFields } from "./form-fields/LocationFields";
import { CompensationFields } from "./form-fields/CompensationFields";
import { JobDetailsFields } from "./form-fields/JobDetailsFields";
import { useJobPostingForm } from "./hooks/useJobPostingForm";
import { Loader2 } from "lucide-react";

interface JobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JobPostingForm({ jobId, onSuccess, onCancel }: JobPostingFormProps) {
  const { form, onSubmit, isLoading } = useJobPostingForm({ jobId, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <BasicInfoFields control={form.control} />
        <LocationFields control={form.control} />
        <CompensationFields control={form.control} />
        <JobDetailsFields control={form.control} />

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {jobId ? "Update" : "Create"} Job Posting
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
