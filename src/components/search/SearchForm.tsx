
import { useState } from "react";
import { Button } from "@/components/ui/button"; 
import { Card } from "@/components/ui/card";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { CompanyNameInput } from "./CompanyNameInput";
import { useSearchForm } from "./hooks/useSearchForm";
import { SearchType } from "./hooks/types";
import { ProcessingProgress } from "./ProcessingProgress";
import { FileUploadHandler } from "./FileUploadHandler";
import { AgentProcessor } from "./AgentProcessor";

export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, content: string) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
}

export const SearchForm = ({ 
  userId, 
  onJobCreated,
  currentJobId,
  isProcessingComplete 
}: SearchFormProps) => {
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);

  const { 
    searchText, 
    setSearchText, 
    companyName, 
    setCompanyName, 
    isProcessing, 
    searchType, 
    setSearchType, 
    handleSubmit, 
    handleFileUpload 
  } = useSearchForm(userId, onJobCreated, currentJobId);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search form submitted with:", { searchText, searchType, companyName });
    
    await handleSubmit(e);
    
    // If we need to process results with Agent, set the flag
    if (!isProcessingComplete && currentJobId && searchText && !isAgentProcessing) {
      console.log("Starting agent processing for job ID:", currentJobId);
      setIsAgentProcessing(true);
    }
  };

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormHeader />
        
        <div className="space-y-4">
          <SearchTypeToggle 
            searchType={searchType}
            onChange={(type: SearchType) => {
              console.log("Search type changed to:", type);
              setSearchType(type);
            }}
          />
          
          {searchType === "candidates-at-company" && (
            <CompanyNameInput 
              companyName={companyName} 
              onChange={setCompanyName} 
            />
          )}
          
          <ContentTextarea 
            value={searchText} 
            onChange={setSearchText} 
            placeholder="Paste job description here..." 
          />
          
          <div className="flex justify-between items-center">
            <FileUploadHandler onFileUpload={handleFileUpload} />
            
            <Button 
              type="submit" 
              disabled={isProcessing || !searchText}
              className="border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {isProcessing ? 'Processing...' : 'Generate Search String'}
            </Button>
          </div>
        </div>
      </form>
      
      {isProcessing && (
        <ProcessingProgress 
          message="Generating search string..." 
          progress={50} 
        />
      )}
      
      {isAgentProcessing && currentJobId && (
        <AgentProcessor 
          content={searchText} 
          jobId={currentJobId} 
          onComplete={() => {
            console.log("Agent processing completed");
            setIsAgentProcessing(false);
          }} 
        />
      )}
    </Card>
  );
};
