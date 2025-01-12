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
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);
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
    if (agentOutput) {
      console.log("Setting data ready from existing agent output");
      setDataReady(true);
    }
  }, [agentOutput]);

  useEffect(() => {
    if (isProcessingComplete && !showResults) {
      console.log("Processing complete, showing analysis loading");
      setDataReady(true);
    }
  }, [isProcessingComplete, showResults]);

  const handleClose = () => {
    onClose();
    window.history.pushState({}, '', '/');
  };

  if (!jobId) return null;

  return (
    <>
      {!showResults && isProcessingComplete && (
        <AnalysisLoading
          isProcessingComplete={isProcessingComplete}
          dataReady={dataReady}
          onCancel={handleClose}
          onViewReport={() => {
            console.log("View report clicked");
            setDataReady(true);
            // Instead of calling onClose here, we want to show the results
            onClose(); // This will reset the loading modal
          }}
        />
      )}
      
      {agentOutput && showResults && (
        <AnalysisResults jobId={jobId} onClose={handleClose} />
      )}
    </>
  );
};

export default ResultsGrid;