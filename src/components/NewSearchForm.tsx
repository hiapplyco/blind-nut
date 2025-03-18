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
    }
    
    // If search string is directly provided in state, use it
    if (state?.searchString) {
      setSearchString(state.searchString);
      setShowGoogleSearch(true);
    }
  }, [location.state]);

  // Auto-run analysis if coming from job editor or if autoRun is true
  useEffect(() => {
    if ((autoRun || (location.state as any)?.autoRun) && searchText) {
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
      setIsProcessingComplete(true);
      
      // If we have a search string in the agent output, use it
      if (agentOutput.searchString) {
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
    if (!searchString || searchString.trim() === '') {
      toast.error("Cannot search with empty search string");
      return;
    }
    
    // Ensure search string contains LinkedIn site constraint
    const finalSearchString = searchString.includes("site:linkedin.com/in/") 
      ? searchString 
      : `${searchString} site:linkedin.com/in/`;
    
    setSearchString(finalSearchString);
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
