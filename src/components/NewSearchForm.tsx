import { memo, useState, useEffect, useCallback } from "react"; // Added memo, useCallback
import { SearchForm } from "./search/SearchForm";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs"; // Added useClientAgentOutputs
import { GoogleSearchWindow } from "./search/GoogleSearchWindow"; // Added GoogleSearchWindow (might be needed if AnalysisReport uses it or if we add it back)
import { supabase } from "@/integrations/supabase/client"; // Added supabase
import { toast } from "sonner"; // Added toast
import { AgentProcessor } from "./search/AgentProcessor";
import { GenerateAnalysisButton } from "./search/analysis/GenerateAnalysisButton";
import { AnalysisReport } from "./search/analysis/AnalysisReport";
import { useSearchForm } from "./search/hooks/useSearchForm";

interface NewSearchFormProps {
  userId: string | null;
  initialRequirements?: any;
  initialJobId?: number;
  autoRun?: boolean;
}

const NewSearchForm = ({ userId, initialRequirements, initialJobId, autoRun = false }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const location = useLocation(); // Keep useLocation
  const [currentJobId, setCurrentJobId] = useState<number | null>(initialJobId || null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false); // Keep from stashed

  // Define handleJobCreated *before* calling the hook that uses it
  const handleJobCreated = (jobId: number, submittedText: string) => {
    console.log("Job created:", { jobId, submittedText });
    setCurrentJobId(jobId);
    setIsProcessingComplete(false); // Reset completion status on new job
    setIsGeneratingAnalysis(false); // Reset analysis status
  };

  // Get state and handlers from the hook
  const {
    searchText,
    setSearchText, // RAW setter
    isProcessing,
    searchString, // Keep searchString state from hook
    handleSubmit,
    handleFileUpload,
  } = useSearchForm(userId, handleJobCreated, currentJobId);

  // Only call useAgentOutputs if we have a currentJobId
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId || 0);
  const { setOutput } = useClientAgentOutputs(); // Keep from upstream

  // Handler from stashed changes
  const handleProcessingComplete = () => {
    console.log("Processing complete");
    if (agentOutput) {
      setIsProcessingComplete(true);
      setIsGeneratingAnalysis(false);
    }
  };

  // useEffect from upstream to handle initial state
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean; searchString?: string } | null;
    if (state?.content) {
      setSearchText(state.content); // Use setSearchText from hook
    }
    // Note: Handling state.searchString might need adjustment depending on how GoogleSearchWindow is used now
    // if (state?.searchString) {
    //   setSearchString(state.searchString); // Need setSearchString from hook if we keep this
    //   setShowGoogleSearch(true); // Need showGoogleSearch state if we keep this
    // }
  }, [location.state, setSearchText]); // Add setSearchText dependency

  // Auto-run analysis (adjusted from upstream)
  useEffect(() => {
    // Use searchText from hook
    if ((autoRun || (location.state as any)?.autoRun) && searchText) {
      // Trigger analysis generation instead of direct search/form submission
      if (!isProcessing && !isGeneratingAnalysis && currentJobId) {
         handleGenerateAnalysis(); // Assuming this function exists or needs to be created
      }
      // Clear autoRun state
      if (location.state) {
        window.history.replaceState({}, document.title);
      }
    }
  // Add dependencies based on hook usage
  }, [autoRun, searchText, location.state, isProcessing, isGeneratingAnalysis, currentJobId]);

  // Monitor agent output changes (adjusted from upstream)
  useEffect(() => {
    if (agentOutput && !isLoading) {
      setIsProcessingComplete(true); // Set processing complete when output arrives
      // Logic to set searchString from agentOutput or job record can remain
      if (agentOutput.searchString) {
        // setSearchString(agentOutput.searchString); // Need setSearchString from hook
        toast.success("Search string generated successfully!");
      } else if (agentOutput.job_id) {
        const fetchJobSearchString = async () => {
          try {
            const { data, error } = await supabase
              .from('jobs')
              .select('search_string')
              .eq('id', agentOutput.job_id)
              .single();
            if (error) throw error;
            if (data?.search_string) {
              // setSearchString(data.search_string); // Need setSearchString from hook
              toast.success("Search string generated successfully!");
            }
          } catch (error) {
            console.error("Error fetching job search string:", error);
          }
        };
        fetchJobSearchString();
      }
    }
  // Add dependencies based on hook usage
  }, [agentOutput, isLoading, /* setSearchString */]);

  // Placeholder for analysis generation trigger
  const handleGenerateAnalysis = useCallback(() => {
      if (!searchText || !currentJobId) {
          toast.error("Cannot generate analysis without requirements and a job ID.");
          return;
      }
      console.log("Triggering analysis generation...");
      setIsGeneratingAnalysis(true);
      setIsProcessingComplete(false); // Reset completion status
  }, [searchText, currentJobId]);


  return (
    <div className="space-y-6">
      {/* Render SearchForm using props from hook (stashed version) */}
      <SearchForm
        userId={userId}
        onJobCreated={handleJobCreated}
        currentJobId={currentJobId}
      />

      {/* Render AnalysisReport section (stashed version) */}
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
              onComplete={handleProcessingComplete} // Use handler defined above
            />
          )}
          {!isGeneratingAnalysis && !isProcessingComplete && agentOutput && ( // Only show button if analysis hasn't started but processing is done
             <GenerateAnalysisButton onClick={handleGenerateAnalysis} />
          )}
           {/* Optionally add a loading indicator while agentOutput is loading */}
           {isLoading && <p>Loading analysis data...</p>}
        </AnalysisReport>
      )}
       {/* Decide if GoogleSearchWindow is still needed - maybe triggered from AnalysisReport? */}
       {/* {showGoogleSearch && searchString && (
         <div>
           <GoogleSearchWindow
             searchTerm={searchText}
             searchString={searchString}
             jobId={currentJobId}
           />
         </div>
       )} */}
    </div>
  );
};

export default memo(NewSearchForm);
