import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useState, useEffect } from "react";
import { AnalysisLoading } from "./AnalysisLoading";
import { AnalysisResults } from "./AnalysisResults";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
  showResults: boolean;
  onClose: () => void;
}

export const ResultsGrid = ({ 
  jobId, 
  isProcessingComplete,
  showResults,
  onClose
}: ResultsGridProps) => {
  const { data: agentOutput, isLoading, refetch } = useAgentOutputs(jobId);
  const [dataReady, setDataReady] = useState(false);

  console.log("ResultsGrid state:", { 
    jobId, 
    isProcessingComplete, 
    isLoading, 
    agentOutput,
    dataReady,
    showResults 
  });

  useEffect(() => {
    if (isProcessingComplete && !dataReady && !agentOutput) {
      const pollInterval = setInterval(() => {
        console.log("Polling for data...");
        refetch().then((result) => {
          if (result.data) {
            console.log("Data found:", result.data);
            setDataReady(true);
            clearInterval(pollInterval);
          }
        });
      }, 1000);

      return () => clearInterval(pollInterval);
    }
  }, [isProcessingComplete, dataReady, agentOutput, refetch]);

  const handleClose = () => {
    onClose();
    // Remove URL parameters without refreshing the page
    window.history.pushState({}, '', '/');
  };

  if (!jobId) return null;

  if (!dataReady || isLoading) {
    return (
      <AnalysisLoading
        isProcessingComplete={isProcessingComplete}
        dataReady={dataReady}
        onCancel={handleClose}
      />
    );
  }

  if (agentOutput && showResults) {
    return <AnalysisResults jobId={jobId} onClose={handleClose} />;
  }

  return null;
};

export default ResultsGrid;