
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { PDFReport } from "./PDFReport";

interface AnalysisResultsProps {
  jobId: number;
  onClose: () => void;
}

export const AnalysisResults = ({ jobId, onClose }: AnalysisResultsProps) => {
  const { data: agentOutput } = useAgentOutputs(jobId);

  if (!agentOutput) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PDFReport
        jobSummary={agentOutput.job_summary || ''}
        enhancedDescription={agentOutput.enhanced_description || ''}
        compensationAnalysis={agentOutput.compensation_analysis || ''}
        terms={agentOutput.terms}
        searchString=""
        jobId={jobId}
      />
    </div>
  );
};
