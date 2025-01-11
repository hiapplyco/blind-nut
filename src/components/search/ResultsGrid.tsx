import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";

interface ResultsGridProps {
  jobId: number | null;
}

export const ResultsGrid = ({ jobId }: ResultsGridProps) => {
  if (!jobId) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KeyTermsWindow jobId={jobId} />
      <CompensationAnalysis jobId={jobId} />
      <JobDescriptionEnhancer jobId={jobId} />
      <JobSummary jobId={jobId} />
    </div>
  );
};