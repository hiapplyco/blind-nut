
import { memo, useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { GoogleSearchWindow } from "./search/GoogleSearchWindow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  
  // Only call useAgentOutputs if we have a currentJobId
  const { data: agentOutput, isLoading } = useAgentOutputs(currentJobId || 0);
  const { setOutput } = useClientAgentOutputs();

  // Get content from location state if present
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean; searchString?: string } | null;
    if (state?.content) {
      setSearchText(state.content);
      console.log("Content from state:", state.content);
    }
    
    // If search string is directly provided in state, use it
    if (state?.searchString) {
      console.log("Search string from state:", state.searchString);
      setSearchString(state.searchString);
      setShowGoogleSearch(true);
    }
  }, [location.state]);

  // Auto-run analysis if coming from job editor or if autoRun is true
  useEffect(() => {
    if ((autoRun || (location.state as any)?.autoRun) && searchText) {
      console.log("Auto-running search with:", searchText);
      // For direct searches without processing, set the search string directly
      if (searchText.includes("site:linkedin.com/in/")) {
        setSearchString(searchText);
        setShowGoogleSearch(true);
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
        console.log("Using search string from agent output:", agentOutput.searchString);
        setSearchString(agentOutput.searchString);
        toast.success("Search string generated successfully!");
      } else if (agentOutput.job_id) {
        // If no search string in agent output, try to fetch from job record
        const fetchJobSearchString = async () => {
          try {
            const { data, error } = await supabase
              .from('jobs')
              .select('search_string')
              .eq('id', agentOutput.job_id)
              .single();
            
            if (error) throw error;
            
            if (data?.search_string) {
              console.log("Using search string from job record:", data.search_string);
              setSearchString(data.search_string);
              toast.success("Search string generated successfully!");
            }
          } catch (error) {
            console.error("Error fetching job search string:", error);
          }
        };
        
        fetchJobSearchString();
      }
    }
  }, [agentOutput, isLoading]);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    
    // Reset state when a new search is submitted
    if (currentJobId !== jobId) {
      setIsProcessingComplete(false);
      setSearchString("");
      setShowGoogleSearch(false);
      
      // Clear any previous agent output for the new job
      setOutput(jobId, null);
    }
    
    setCurrentJobId(jobId);
  };

  const handleShowGoogleSearch = (searchString: string) => {
    console.log("handleShowGoogleSearch called with:", searchString);
    
    if (!searchString || searchString.trim() === '') {
      console.error("Empty search string provided to handleShowGoogleSearch");
      toast.error("Cannot search with empty search string");
      return;
    }
    
    // Ensure search string contains LinkedIn site constraint
    const finalSearchString = searchString.includes("site:linkedin.com/in/") 
      ? searchString 
      : `${searchString} site:linkedin.com/in/`;
    
    console.log("Setting search string:", finalSearchString);
    setSearchString(finalSearchString);
    
    console.log("Setting showGoogleSearch to true");
    setShowGoogleSearch(true);
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
        onShowGoogleSearch={handleShowGoogleSearch}
      />
      
      {showGoogleSearch && searchString && (
        <div>
          <div className="bg-yellow-100 p-3 mb-4 border-l-4 border-yellow-500 text-sm">
            <p className="font-semibold">Debug Info:</p>
            <p>Search Text: {searchText ? `"${searchText.substring(0, 50)}${searchText.length > 50 ? '...' : ''}"` : 'None'}</p>
            <p>Search String: {searchString ? `"${searchString}"` : 'None'}</p>
            <p>Current Job ID: {currentJobId || 'None'}</p>
          </div>
          
          <GoogleSearchWindow 
            searchTerm={searchText} 
            searchString={searchString} 
            jobId={currentJobId} 
          />
        </div>
      )}
    </div>
  );
};

export default memo(NewSearchForm);
