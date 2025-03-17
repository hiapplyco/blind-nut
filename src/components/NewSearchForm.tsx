
import { memo, useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { GoogleSearchWindow } from "./search/GoogleSearchWindow";

interface NewSearchFormProps {
  userId: string | null;
  initialRequirements?: any;
  initialJobId?: number;
  autoRun?: boolean;
}

const NewSearchForm = ({ userId, initialRequirements, initialJobId, autoRun = false }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentJobId, setCurrentJobId] = useState<number | null>(initialJobId || null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchString, setSearchString] = useState("");
  
  // Only call useAgentOutputs if we have a currentJobId
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId || 0);
  const { setOutput } = useClientAgentOutputs();

  // Get content from location state if present
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content) {
      setSearchText(state.content);
      console.log("Content from state:", state.content);
    }
  }, [location.state]);

  // Auto-run analysis if coming from job editor or if autoRun is true
  useEffect(() => {
    if ((autoRun || (location.state as any)?.autoRun) && searchText) {
      console.log("Auto-running search with:", searchText);
      // For direct searches without processing, set the search string directly
      if (searchText.includes("site:linkedin.com/in/")) {
        setSearchString(searchText);
      } else {
        // Otherwise let the form submission handle it
        const form = document.querySelector("form");
        if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
      
      // Clear autoRun state to prevent multiple runs
      if (location.state) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [autoRun, searchText, location.state]);

  // Monitor agent output changes
  useEffect(() => {
    if (agentOutput && !isLoading) {
      console.log("Agent output received:", agentOutput);
      setIsProcessingComplete(true);
      
      // If we have a search string in the agent output, use it
      // Use optional chaining to safely access the property
      if (agentOutput.searchString) {
        setSearchString(agentOutput.searchString);
      }
    }
  }, [agentOutput, isLoading]);

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

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
      />
      
      {searchString && (
        <GoogleSearchWindow 
          searchTerm={searchText} 
          searchString={searchString} 
          jobId={currentJobId} 
        />
      )}
    </div>
  );
};

export default memo(NewSearchForm);
