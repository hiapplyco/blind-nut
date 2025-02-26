
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useJobPostingForm } from "./hooks/useJobPostingForm";
import { Loader2 } from "lucide-react";

interface JobPostingFormProps {
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const placeholder = `Title: Software Engineer
Client: Example Corp
Location: San Francisco
Salary Range: 100000 - 150000
Job Type: Full-time
Experience Level: Mid
Skills Required: React, TypeScript, Node.js
Application Deadline: 2024-12-31
Remote Allowed: Yes

Description:
We are looking for a talented Software Engineer to join our team...`;

export function JobPostingForm({ jobId, onSuccess, onCancel }: JobPostingFormProps) {
  const { form, onSubmit, isLoading } = useJobPostingForm({ jobId, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[500px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
