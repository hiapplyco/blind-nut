
import { memo, useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { useNavigate } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
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
      
      // Clear any previous agent output for the new job
      setOutput(jobId, null);
    }
    
    setCurrentJobId(jobId);
  };

  // Monitor agent output changes
  useEffect(() => {
    if (agentOutput && !isLoading) {
      console.log("Agent output received:", agentOutput);
      setIsProcessingComplete(true);
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
      
      {/* Analysis Report section removed */}
    </div>
  );
};

export default memo(NewSearchForm);
