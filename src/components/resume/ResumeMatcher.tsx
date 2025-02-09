
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MatchCard } from "./MatchCard";

interface ResumeMatcherProps {
  jobId: number;
  userId: string;
}

interface ResumeMatch {
  id: number;
  similarity_score: number;
  matching_keywords: string[] | null;
  matching_entities: string[] | null;
  created_at: string;
  parsed_resume: {
    skills?: string[];
    experience?: string[];
    education?: string[];
  } | null;
  parsed_job: {
    required_skills?: string[];
    qualifications?: string[];
    responsibilities?: string[];
  } | null;
}

export const ResumeMatcher = ({ jobId, userId }: ResumeMatcherProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ["resume-matches", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_matches")
        .select(`
          id,
          similarity_score,
          matching_keywords,
          matching_entities,
          created_at,
          parsed_resume,
          parsed_job
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
        throw error;
      }
      return data as ResumeMatch[];
    },
    retry: 1
  });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !allowedExtensions.includes(extension)) {
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

      await refetch();
      toast.success("Resume analyzed successfully!");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Error analyzing resume:', error);
      toast.error(`Failed to analyze resume: ${message}`);
    } finally {
      setIsUploading(false);
    }
  }, [jobId, userId, refetch]);

  const handleViewReport = useCallback((matchId: number) => {
    navigate(`/resume-report/${matchId}`);
  }, [navigate]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Resume Matcher</h3>
          <Button 
            variant="outline" 
            className="relative"
            disabled={isUploading}
          >
            <label className="absolute inset-0 w-full h-full cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Analyzing..." : "Upload Resume"}
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          Upload a resume to compare it with this job description and get a similarity score.
        </p>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        ) : matches?.length ? (
          <div className="space-y-4 mt-6">
            {matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onViewReport={handleViewReport}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            No resumes analyzed yet. Upload a resume to get started.
          </p>
        )}
      </div>
    </Card>
  );
};
