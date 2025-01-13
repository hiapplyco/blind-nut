import { useState } from "react";
import { SearchForm } from "./search/SearchForm";
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisGrid } from "./search/analysis/AnalysisGrid";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: agentOutput } = useAgentOutputs(currentJobId);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    setCurrentJobId(jobId);
    setIsProcessingComplete(false);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    setIsProcessingComplete(true);
    toast.success("Analysis complete!");
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
      />
      
      {currentJobId && !isProcessingComplete && (
        <AgentProcessor
          content={searchText}
          jobId={currentJobId}
          onComplete={handleProcessingComplete}
        />
      )}

      {currentJobId && isProcessingComplete && (
        <div className="mt-8">
          <AnalysisGrid jobId={currentJobId} />
        </div>
      )}
    </div>
  );
};

export default NewSearchForm;