import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useState, useEffect } from "react";
import { AnalysisLoading } from "./AnalysisLoading";
import { ViewReportButton } from "./ViewReportButton";
import { AnalysisResults } from "./AnalysisResults";

interface ResultsGridProps {
  jobId: number | null;
  isProcessingComplete: boolean;
}

export const ResultsGrid = ({ jobId, isProcessingComplete }: ResultsGridProps) => {
  const { data: agentOutput, isLoading, refetch } = useAgentOutputs(jobId);
  const [showResults, setShowResults] = useState(false);
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
    setShowResults(false);
    setDataReady(false);
    window.history.pushState({}, '', '/');
    window.location.reload();
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

  if (agentOutput && !showResults) {
    return <ViewReportButton onClick={() => setShowResults(true)} />;
  }

  if (agentOutput && showResults) {
    return <AnalysisResults jobId={jobId} onClose={handleClose} />;
  }

  return null;
};

export default ResultsGrid;