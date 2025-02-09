
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ResumeMatcherProps {
  jobId: number;
  userId: string;
}

// Define type for resume match
interface ResumeMatch {
  id: number;
  similarity_score: number;
  matching_keywords: string[] | null;
  matching_entities: string[] | null;
  created_at: string;
}

export const ResumeMatcher = ({ jobId, userId }: ResumeMatcherProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["resume-matches", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_matches")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ResumeMatch[];
    }
  });

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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Resume Matcher</h3>
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
              <Card key={match.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-gray-600">Similarity Score:</span>
                      <span className="ml-2 text-lg font-semibold">
                        {match.similarity_score}%
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(match.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {match.matching_keywords && match.matching_keywords.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Matching Keywords:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {match.matching_keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.matching_entities && match.matching_entities.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Matching Entities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {match.matching_entities.map((entity, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
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
