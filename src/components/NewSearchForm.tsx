
import { memo, useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { GenerateAnalysisButton } from "./search/analysis/GenerateAnalysisButton";
import { AnalysisReport } from "./search/analysis/AnalysisReport";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";

interface NewSearchFormProps {
  userId: string | null;
  initialRequirements?: any;
  initialJobId?: number;
  autoRun?: boolean;
}

const NewSearchForm = ({ userId, initialRequirements, initialJobId, autoRun = false }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(initialJobId || null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  
  // Only call useAgentOutputs if we have a currentJobId
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId || 0);
  const { setOutput } = useClientAgentOutputs();

  // Auto-run analysis if coming from job editor
  useEffect(() => {
    if (autoRun && initialJobId && agentOutput) {
      setCurrentJobId(initialJobId);
      setIsProcessingComplete(true);
    }
  }, [autoRun, initialJobId, agentOutput]);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    
    // Reset state when a new search is submitted
    if (currentJobId !== jobId) {
      setIsProcessingComplete(false);
      setIsGeneratingAnalysis(false);
      
      // Clear any previous agent output for the new job
      setOutput(jobId, null);
    }
    
    setCurrentJobId(jobId);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    // Don't set processing complete until we have agent output
    if (agentOutput) {
      setIsProcessingComplete(true);
      setIsGeneratingAnalysis(false);
    }
  };

  const handleGenerateAnalysis = () => {
    console.log("Starting analysis generation");
    setIsGeneratingAnalysis(true);
  };

  // Monitor agent output changes
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
      
      {currentJobId && (
        <AnalysisReport 
          agentOutput={agentOutput}
          isGeneratingAnalysis={isGeneratingAnalysis}
          isProcessingComplete={isProcessingComplete}
        >
          {isGeneratingAnalysis && !isProcessingComplete && (
            <AgentProcessor
              content={searchText}
              jobId={currentJobId}
              onComplete={handleProcessingComplete}
            />
          )}
          {!isGeneratingAnalysis && !isProcessingComplete && (
            <GenerateAnalysisButton onClick={handleGenerateAnalysis} />
          )}
        </AnalysisReport>
      )}
    </div>
  );
};

export default memo(NewSearchForm);
