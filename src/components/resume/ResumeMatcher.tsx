
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MatchCard } from "./MatchCard";
import { useResumeUpload } from "./hooks/useResumeUpload";
import { useResumeMatches } from "./hooks/useResumeMatches";
import type { ResumeMatcherProps } from "./types";

export const ResumeMatcher = ({ jobId, userId }: ResumeMatcherProps) => {
  const navigate = useNavigate();
  const { isUploading, handleFileUpload } = useResumeUpload(jobId, userId);
  const { data: matches, isLoading } = useResumeMatches(jobId);

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
