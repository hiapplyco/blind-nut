import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processJobRequirements } from "@/utils/jobRequirements";
import { supabase } from "@/integrations/supabase/client";
import { SearchTypeToggle } from "@/components/search/SearchTypeToggle";
import { FormHeader } from "@/components/search/FormHeader";
import { ContentTextarea } from "@/components/search/ContentTextarea";
import { CompanyNameInput } from "@/components/search/CompanyNameInput";
import { SubmitButton } from "@/components/search/SubmitButton";
import { Bot, Loader2 } from "lucide-react";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { useLocation } from "react-router-dom";

type SearchType = "candidates" | "companies" | "candidates-at-company";

interface SearchFormProps {
  userId: string;
  onJobCreated: (jobId: number, searchText: string) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
  onViewReport: () => void;
}

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId,
  isProcessingComplete,
  onViewReport 
}: SearchFormProps) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const { data: agentOutput } = useAgentOutputs(currentJobId);

  useEffect(() => {
    // Handle auto-run from location state
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content && state?.autoRun) {
      setSearchText(state.content);
      // Clear the state to prevent re-running
      window.history.replaceState({}, document.title);
      // Trigger the search
      handleSubmit(new Event('submit') as any);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          content: searchText,
          user_id: userId
        })
        .select()
        .single();

      if (jobError) throw jobError;
      
      const jobId = jobData.id;
      onJobCreated(jobId, searchText);

      const result = await processJobRequirements(searchText, searchType, companyName, userId);
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ search_string: result.searchString })
        .eq('id', jobId);

      if (updateError) throw updateError;

      toast.success("Search string generated successfully!");

    } catch (error) {
      console.error('Error processing content:', error);
      toast.error("Failed to process content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error("Invalid file type. Please upload a PDF file or an image");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: formData,
      });

      if (error) throw error;

      if (data?.text) {
        setSearchText(data.text);
        toast.success("File processed successfully. The content has been extracted and added to the input field.");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error("Failed to process the file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextUpdate = (text: string) => {
    setSearchText(text);
  };

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {currentJobId && isProcessingComplete && agentOutput && (
        <div className="mb-6">
          <Button
            type="button"
            onClick={onViewReport}
            className="w-full border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Bot className="w-5 h-5 mr-2" />
            Download Analysis Report
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <SearchTypeToggle 
          value={searchType} 
          onValueChange={(value) => setSearchType(value)} 
        />
        
        <FormHeader />
        
        <ContentTextarea
          searchText={searchText}
          isProcessing={isProcessing}
          onTextChange={setSearchText}
          onFileUpload={handleFileUpload}
          onTextUpdate={handleTextUpdate}
        />

        {searchType === "candidates-at-company" && (
          <CompanyNameInput
            companyName={companyName}
            isProcessing={isProcessing}
            onChange={setCompanyName}
          />
        )}

        <div className="space-y-4">
          <SubmitButton 
            isProcessing={isProcessing || isScrapingProfiles}
            isDisabled={isProcessing || isScrapingProfiles || !searchText || (searchType === "candidates-at-company" && !companyName)}
          />
          
          {isScrapingProfiles && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scraping profiles from search results...</span>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default SearchForm;