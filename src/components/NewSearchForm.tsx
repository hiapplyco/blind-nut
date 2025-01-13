import { useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { GenerateAnalysisButton } from "./search/analysis/GenerateAnalysisButton";
import { AnalysisReport } from "./search/analysis/AnalysisReport";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    setCurrentJobId(jobId);
    // Reset states when new search is submitted
    setIsProcessingComplete(false);
    setIsGeneratingAnalysis(false);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    setIsProcessingComplete(true);
    setIsGeneratingAnalysis(false); // Reset analysis state when processing is complete
  };

  const handleGenerateAnalysis = () => {
    console.log("Starting analysis generation");
    setIsGeneratingAnalysis(true);
  };

  // Effect to handle agent output state
  useEffect(() => {
    if (agentOutput && !isLoading) {
      console.log("Agent output received:", agentOutput);
      setIsProcessingComplete(true);
      setIsGeneratingAnalysis(false);
    }
  }, [agentOutput, isLoading]);

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
      />
      
      {/* Show AgentProcessor only when generating analysis and not complete */}
      {currentJobId && isGeneratingAnalysis && !isProcessingComplete && (
        <AgentProcessor
          content={searchText}
          jobId={currentJobId}
          onComplete={handleProcessingComplete}
        />
      )}

      {/* Show Generate Analysis button when we have a job but haven't started analysis */}
      {currentJobId && !isGeneratingAnalysis && !isProcessingComplete && (
        <GenerateAnalysisButton onClick={handleGenerateAnalysis} />
      )}

      {/* Show Analysis Report only when we have agent output */}
      {currentJobId && agentOutput && !isLoading && (
        <AnalysisReport agentOutput={agentOutput} />
      )}
    </div>
  );
};

export default NewSearchForm;