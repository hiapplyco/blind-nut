import { memo, useState, useEffect, useCallback } from "react";
import { SearchForm } from "./search/SearchForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { GoogleSearchWindow } from "./search/GoogleSearchWindow";
import { StructuredSearchResults } from "./search/StructuredSearchResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgentProcessor } from "./search/AgentProcessor";
import { GenerateAnalysisButton } from "./search/analysis/GenerateAnalysisButton";
import { AnalysisReport } from "./search/analysis/AnalysisReport";
import { useSearchForm } from "./search/hooks/useSearchForm";

interface NewSearchFormProps {
  userId: string | null;
  initialRequirements?: any; // Consider defining a more specific type if possible
  initialJobId?: number;
  autoRun?: boolean;
}

const NewSearchForm = ({ userId, initialRequirements, initialJobId, autoRun = false }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentJobId, setCurrentJobId] = useState<number | null>(initialJobId || null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [showGoogleSearch, setShowGoogleSearch] = useState(false); // Local state for UI control

  // Handler for when SearchForm creates/submits a job
  const handleJobCreatedOrSubmitted = (jobId: number, submittedText: string) => {
    console.log("Job created/submitted:", { jobId, submittedText });

    // Reset state if it's a new job ID being submitted
    if (currentJobId !== jobId) {
        setIsProcessingComplete(false);
        setIsGeneratingAnalysis(false);
        setShowGoogleSearch(false);
        // Clear previous agent output for the new job in client store
        setOutput(jobId, null);
        // Reset searchString via the hook's setter if needed (depends on hook logic)
        // setSearchString(""); // Uncomment if hook doesn't reset automatically
    }

    setCurrentJobId(jobId);
    // setSearchText(submittedText); // Update searchText via hook if needed
  };

  // Get state and handlers from the hook
  const {
    searchText,
    setSearchText, // Setter from hook
    isProcessing, // Processing state from hook
    searchString, // Generated search string state from hook
    setSearchString, // Setter for search string from hook
    handleSubmit, // Form submission handler from hook
    handleFileUpload, // File upload handler from hook
  } = useSearchForm(userId, handleJobCreatedOrSubmitted, currentJobId);

  // Fetch agent outputs based on the current job ID
  const { data: agentOutput, isLoading: isLoadingAgentOutput } = useAgentOutputs(currentJobId || 0);
  const { setOutput } = useClientAgentOutputs(); // Client-side store setter

  // Handler for when AgentProcessor completes
  const handleProcessingComplete = () => {
    console.log("Agent processing complete");
    setIsProcessingComplete(true);
    setIsGeneratingAnalysis(false); // Analysis generation is done
  };

  // Effect to handle initial state from navigation (e.g., content prefill, direct search string)
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean; searchString?: string } | null;
    if (state?.content) {
      setSearchText(state.content); // Use setSearchText from hook
    }
    // If search string is directly provided in state, use it to show Google Search
    if (state?.searchString) {
      setSearchString(state.searchString); // Use setSearchString from hook
      setShowGoogleSearch(true); // Use local state setter
    }
     // Clear state after processing to prevent re-triggering on refresh/navigation
     if (state) {
        window.history.replaceState({}, document.title);
     }
  }, [location.state, setSearchText, setSearchString]); // Add hook setters as dependencies

  // Effect to handle auto-running analysis generation
  useEffect(() => {
    if ((autoRun || (location.state as any)?.autoRun) && searchText && currentJobId && !isProcessing && !isGeneratingAnalysis) {
       console.log("Auto-running analysis generation...");
       handleGenerateAnalysis(); // Trigger analysis
       // Clear autoRun state from navigation
       if (location.state) {
         window.history.replaceState({}, document.title);
       }
    }
  }, [autoRun, searchText, location.state, isProcessing, isGeneratingAnalysis, currentJobId]); // Dependencies

  // Effect to monitor agent output changes and update state
  useEffect(() => {
    if (agentOutput && !isLoadingAgentOutput) {
      console.log("Agent output received:", agentOutput);
      setIsProcessingComplete(true); // Mark processing as complete

      // If search string exists in output, update state via hook
      if (agentOutput.searchString) {
        setSearchString(agentOutput.searchString);
        toast.success("Search string generated successfully!");
      } else if (agentOutput.job_id) {
        // If no search string in output, try fetching from the job record
        const fetchJobSearchString = async () => {
          console.log("Fetching search string for job:", agentOutput.job_id);
          try {
            const { data, error } = await supabase
              .from('jobs')
              .select('search_string')
              .eq('id', agentOutput.job_id)
              .single();

            if (error) throw error;

            if (data?.search_string) {
              setSearchString(data.search_string); // Update via hook
              toast.success("Search string generated successfully!");
            } else {
              console.log("No search string found in job record.");
            }
          } catch (error) {
            console.error("Error fetching job search string:", error);
            // Optionally notify user: toast.error("Could not retrieve search string.");
          }
        };
        fetchJobSearchString();
      }
    }
  }, [agentOutput, isLoadingAgentOutput, setSearchString]); // Add setSearchString dependency

  // Callback to trigger analysis generation
  const handleGenerateAnalysis = useCallback(() => {
      if (!searchText || !currentJobId) {
          toast.error("Cannot generate analysis without requirements and a job ID.");
          return;
      }
      console.log("Triggering analysis generation for job:", currentJobId);
      setIsGeneratingAnalysis(true);
      setIsProcessingComplete(false); // Reset completion status as analysis is starting
  }, [searchText, currentJobId]);

  // Handler passed to SearchForm to trigger showing the Google Search window
  const handleShowGoogleSearch = (generatedSearchString: string) => {
    if (!generatedSearchString || generatedSearchString.trim() === '') {
      toast.error("Cannot search with empty search string");
      return;
    }
    console.log("Showing Google Search for:", generatedSearchString);
    // Ensure search string contains LinkedIn site constraint (optional, depends on desired behavior)
    const finalSearchString = generatedSearchString.includes("site:linkedin.com/in/")
      ? generatedSearchString
      : `${generatedSearchString} site:linkedin.com/in/`;

    setSearchString(finalSearchString); // Update state via hook
    setShowGoogleSearch(true); // Update local UI state
  };

  return (
    <div className="space-y-6">
      {/* Render SearchForm using props from hook */}
      <SearchForm
        userId={userId}
        onJobCreated={handleJobCreatedOrSubmitted} // Pass the handler
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete} // Pass completion status
        onShowGoogleSearch={handleShowGoogleSearch} // Pass handler to trigger Google Search display
        // Pass other necessary props like searchText, companyName if SearchForm needs them directly
        // (though useSearchForm hook likely provides them internally)
      />

      {/* Render AnalysisReport section */}
      {currentJobId && (
        <AnalysisReport
          agentOutput={agentOutput}
          isGeneratingAnalysis={isGeneratingAnalysis}
          isProcessingComplete={isProcessingComplete}
        >
          {/* Conditionally render AgentProcessor if analysis is generating */}
          {isGeneratingAnalysis && !isProcessingComplete && (
            <AgentProcessor
              content={searchText} // Use searchText from the hook
              jobId={currentJobId}
              onComplete={handleProcessingComplete} // Handler for when processor finishes
            />
          )}
          {/* Show Generate button only if processing is complete but analysis hasn't started */}
          {!isGeneratingAnalysis && isProcessingComplete && agentOutput && (
             <GenerateAnalysisButton onClick={handleGenerateAnalysis} />
          )}
           {/* Optionally add a loading indicator while agentOutput is loading */}
           {isLoadingAgentOutput && <p>Loading analysis data...</p>}
        </AnalysisReport>
      )}

       {/* Conditionally render StructuredSearchResults based on local state */}
       {showGoogleSearch && searchString && (
         <div className="mt-6"> {/* Add margin */}
           <StructuredSearchResults
             searchString={searchString} // Pass the generated/final search string
             jobId={currentJobId || undefined}
             searchType="candidates"
           />
         </div>
       )}
    </div>
  );
};

export default memo(NewSearchForm);
