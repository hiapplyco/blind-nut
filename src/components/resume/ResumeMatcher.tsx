
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ResumeMatcherProps {
  jobId: number;
  userId: string;
}

export const ResumeMatcher = ({ jobId, userId }: ResumeMatcherProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('plain')) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId.toString());
      formData.append('userId', userId);

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: formData,
      });

      if (error) throw error;

      toast.success("Resume analyzed successfully!");
      
      // Store the analysis results
      const { error: dbError } = await supabase
        .from('resume_matches')
        .insert({
          job_id: jobId,
          resume_file_path: data.filePath,
          resume_text: data.resumeText,
          similarity_score: data.similarityScore,
          parsed_resume: data.parsedResume,
          parsed_job: data.parsedJob,
          matching_keywords: data.matchingKeywords,
          matching_entities: data.matchingEntities
        });

      if (dbError) throw dbError;

    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resume Matcher</h3>
        <p className="text-sm text-gray-600">
          Upload a resume to compare it with this job description and get a similarity score.
        </p>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="relative"
            disabled={isUploading}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Analyzing..." : "Upload Resume"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
