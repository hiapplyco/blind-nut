
import { useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm"; // This will be modified to accept props
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { GenerateAnalysisButton } from "./search/analysis/GenerateAnalysisButton";
import { AnalysisReport } from "./search/analysis/AnalysisReport";
import { useSearchForm } from "./search/hooks/useSearchForm"; // Import the hook here

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  // Removed local searchText state
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  // Define handleJobCreated *before* calling the hook that uses it
  const handleJobCreated = (jobId: number, submittedText: string) => {
    console.log("Job created:", { jobId, submittedText });
    // No need to setSearchText here, hook manages it
    setCurrentJobId(jobId);
    setIsProcessingComplete(false); // Reset completion status on new job
    setIsGeneratingAnalysis(false); // Reset analysis status
  };

  // Get state and handlers from the hook
  const {
    searchText,
    setSearchText, // This is the RAW setter from the hook
    // debouncedSetSearchText, // We might not need the debounced one here anymore
    isProcessing,
    isScrapingProfiles,
    searchString,
    handleSubmit,
    handleFileUpload,
  } = useSearchForm(userId, handleJobCreated, currentJobId); // Use hook here
  
  // Only call useAgentOutputs if we have a currentJobId
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId || 0);

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
      {/* Pass state and handlers down to SearchForm */}
      <SearchForm
        userId={userId} // Keep userId if SearchForm still needs it directly
        // Pass state from hook
        searchText={searchText}
        isProcessing={isProcessing}
        isScrapingProfiles={isScrapingProfiles}
        searchString={searchString}
        // Pass handlers from hook (or wrappers)
        onSearchTextChange={setSearchText} // Pass the RAW setter
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmit}
        // Pass other props if needed by SearchForm/SearchFormContent
        // For audio/URL updates, we might still want the raw setter for immediate feedback
        onTextUpdate={setSearchText}
      />
      
      {currentJobId && (
        <AnalysisReport 
          agentOutput={agentOutput}
          isGeneratingAnalysis={isGeneratingAnalysis}
          isProcessingComplete={isProcessingComplete}
        >
          {isGeneratingAnalysis && !isProcessingComplete && (
            <AgentProcessor
              content={searchText} // Use searchText from the hook
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

export default NewSearchForm;
