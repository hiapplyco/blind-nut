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
    setIsProcessingComplete(false);
    setIsGeneratingAnalysis(false);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    setIsProcessingComplete(true);
  };

  const handleGenerateAnalysis = () => {
    console.log("Starting analysis generation");
    setIsGeneratingAnalysis(true);
  };

  // Effect to check if we have agent output and update state accordingly
  useEffect(() => {
    if (agentOutput && !isLoading) {
      console.log("Agent output received:", agentOutput);
      setIsProcessingComplete(true);
      setIsGeneratingAnalysis(false); // Reset analysis generation state when we have output
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
      
      {currentJobId && !isProcessingComplete && isGeneratingAnalysis && (
        <AgentProcessor
          content={searchText}
          jobId={currentJobId}
          onComplete={handleProcessingComplete}
        />
      )}

      {currentJobId && !isGeneratingAnalysis && !isProcessingComplete && (
        <GenerateAnalysisButton onClick={handleGenerateAnalysis} />
      )}

      {currentJobId && agentOutput && (
        <AnalysisReport agentOutput={agentOutput} />
      )}
    </div>
  );
};

export default NewSearchForm;