import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
}

export const ResultsGrid = ({ jobId, isProcessingComplete }: ResultsGridProps) => {
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  if (!jobId || !isProcessingComplete || isLoading || !agentOutput) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KeyTermsWindow jobId={jobId} />
      <CompensationAnalysis jobId={jobId} />
      <JobDescriptionEnhancer jobId={jobId} />
      <JobSummary jobId={jobId} />
    </div>
  );
};