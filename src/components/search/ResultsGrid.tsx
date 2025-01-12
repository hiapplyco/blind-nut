import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { Card } from "@/components/ui/card";
import { Bot, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
}

export const ResultsGrid = ({ jobId, isProcessingComplete }: ResultsGridProps) => {
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);
  const [showResults, setShowResults] = useState(false);

  console.log("ResultsGrid state:", { jobId, isProcessingComplete, isLoading, agentOutput });

  const handleClose = () => {
    setShowResults(false);
    // Reset the URL without refreshing the page
    window.history.pushState({}, '', '/');
    // Reload the page to reset the state
    window.location.reload();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay background
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!jobId) return null;

  // Show loading state while the agents are processing
  if (!isProcessingComplete || isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-lg p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2 flex-grow">
              <h3 className="text-xl font-bold">Analysis in Progress</h3>
              <p className="text-gray-600">
                Our AI agents are analyzing your content. This process typically takes 30-60 seconds...
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          <Button 
            variant="outline"
            className="mt-4 w-full border-2 border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            disabled={isProcessingComplete && !agentOutput}
          >
            Cancel Analysis
          </Button>
        </Card>
      </div>
    );
  }

  // Show the "View Report" button when processing is complete and we have data
  if (agentOutput && !showResults) {
    return (
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => setShowResults(true)}
          className="border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Bot className="w-5 h-5 mr-2" />
          View Analysis Report
        </Button>
      </div>
    );
  }

  // Show the analysis results in a centered card if we have data and showResults is true
  if (agentOutput && showResults) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto" onClick={handleOverlayClick}>
        <Card className={cn(
          "w-full max-w-4xl bg-[#FFFBF4] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          "animate-scale-in p-6 space-y-6 relative"
        )}>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close results"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              Analysis Results
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeyTermsWindow jobId={jobId} />
            <CompensationAnalysis jobId={jobId} />
            <JobDescriptionEnhancer jobId={jobId} />
            <JobSummary jobId={jobId} />
          </div>
        </Card>
      </div>
    );
  }

  // Return null if we don't have data yet
  return null;
};