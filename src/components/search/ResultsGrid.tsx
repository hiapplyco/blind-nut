import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
}

export const ResultsGrid = ({ jobId, isProcessingComplete }: ResultsGridProps) => {
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  console.log("ResultsGrid state:", { jobId, isProcessingComplete, isLoading, agentOutput });

  if (!jobId) return null;

  // Show loading state while the agents are processing
  if (!isProcessingComplete) {
    return (
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4 animate-pulse">
          <Bot className="w-8 h-8" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Analysis in Progress</h3>
            <p className="text-gray-600">
              Our AI agents are analyzing your content. This usually takes about 15-30 seconds...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state if no data is found after processing is complete
  if (!agentOutput) {
    return (
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <h3 className="text-lg font-bold">No Analysis Results</h3>
          <p className="text-gray-600">
            We couldn't find any analysis results. Please try submitting your content again.
          </p>
        </div>
      </Card>
    );
  }

  // Show the analysis results grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KeyTermsWindow jobId={jobId} />
      <CompensationAnalysis jobId={jobId} />
      <JobDescriptionEnhancer jobId={jobId} />
      <JobSummary jobId={jobId} />
    </div>
  );
};