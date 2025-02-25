
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicInfoFields } from "./form-fields/BasicInfoFields";
import { LocationFields } from "./form-fields/LocationFields";
import { CompensationFields } from "./form-fields/CompensationFields";
import { JobDetailsFields } from "./form-fields/JobDetailsFields";
import { useJobPostingForm } from "./hooks/useJobPostingForm";

interface JobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JobPostingForm({ jobId, onSuccess, onCancel }: JobPostingFormProps) {
  const { form, onSubmit } = useJobPostingForm({ jobId, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <BasicInfoFields control={form.control} />
        <LocationFields control={form.control} />
        <CompensationFields control={form.control} />
        <JobDetailsFields control={form.control} />

        <div className="flex gap-4">
          <Button type="submit">Submit</Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
