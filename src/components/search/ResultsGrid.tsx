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
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  console.log("ResultsGrid state:", { 
    jobId, 
    isProcessingComplete, 
    isLoading, 
    agentOutput,
    dataReady,
    showResults 
  });

  useEffect(() => {
    // Clear any existing polling interval when component unmounts
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  useEffect(() => {
    if (isProcessingComplete && !dataReady && !agentOutput) {
      console.log("Starting polling for data...");
      
      // Clear any existing interval
      if (pollInterval) {
        clearInterval(pollInterval);
      }

      // Start new polling interval
      const interval = setInterval(() => {
        console.log("Polling for data...");
        refetch().then((result) => {
          if (result.data) {
            console.log("Data found:", result.data);
            setDataReady(true);
            clearInterval(interval);
          }
        });
      }, 1000);

      setPollInterval(interval);

      return () => clearInterval(interval);
    }

    // If we already have data, mark as ready
    if (agentOutput && !dataReady) {
      console.log("Setting data ready from existing agent output");
      setDataReady(true);
    }
  }, [isProcessingComplete, dataReady, agentOutput, refetch, pollInterval]);

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