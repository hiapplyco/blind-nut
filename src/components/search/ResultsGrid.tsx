import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { Card } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
}

export const ResultsGrid = ({ jobId, isProcessingComplete }: ResultsGridProps) => {
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  console.log("ResultsGrid state:", { jobId, isProcessingComplete, isLoading, agentOutput });

  if (!jobId) return null;

  // Show loading state while the agents are processing
  if (!isProcessingComplete || isLoading) {
    return (
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2 flex-grow">
            <h3 className="text-lg font-bold">Analysis in Progress</h3>
            <p className="text-gray-600">
              Our AI agents are analyzing your content. This process typically takes 30-60 seconds...
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Show the analysis results grid if we have data
  if (agentOutput) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KeyTermsWindow jobId={jobId} />
        <CompensationAnalysis jobId={jobId} />
        <JobDescriptionEnhancer jobId={jobId} />
        <JobSummary jobId={jobId} />
      </div>
    );
  }

  // Return null if we don't have data yet
  return null;
};