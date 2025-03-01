
import { Button } from "@/components/ui/button";
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
  const { content, setContent, isSubmitting, onSubmit } = useJobPostingForm({ 
    jobId, 
    onSuccess 
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label 
          htmlFor="content" 
          className="block text-sm font-medium mb-2 text-gray-600 font-bold"
        >
          Job Details
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[500px] font-mono border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {jobId ? "Update" : "Create"} Job Posting
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
