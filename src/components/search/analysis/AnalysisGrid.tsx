import { KeyTermsWindow } from "../KeyTermsWindow";
import { CompensationAnalysis } from "../../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../../agents/JobDescriptionEnhancer";
import { JobSummary } from "../../agents/JobSummary";

interface AnalysisGridProps {
  jobId: number;
}

export const AnalysisGrid = ({ jobId }: AnalysisGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KeyTermsWindow jobId={jobId} />
      <CompensationAnalysis jobId={jobId} />
      <JobDescriptionEnhancer jobId={jobId} />
      <JobSummary jobId={jobId} />
    </div>
  );
};