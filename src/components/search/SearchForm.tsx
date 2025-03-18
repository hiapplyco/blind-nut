
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
import { AgentProcessor } from "./AgentProcessor";

export interface SearchFormProps {
  userId: string | null;
  onJobCreated: (jobId: number, content: string, data?: any) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
  source?: 'default' | 'clarvida';
  hideSearchTypeToggle?: boolean;
  submitButtonText?: string;
  onSubmitStart?: () => void;
}

export const SearchForm = ({ 
  userId, 
  onJobCreated,
  currentJobId,
  isProcessingComplete,
  source = 'default',
  hideSearchTypeToggle = false,
  submitButtonText,
  onSubmitStart
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
  } = useSearchForm(userId, onJobCreated, currentJobId, source);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search form submitted with:", { searchText, searchType, companyName });
    
    if (onSubmitStart) {
      onSubmitStart();
    }
    
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
          {!hideSearchTypeToggle && (
            <SearchTypeToggle 
              value={searchType}
              onValueChange={(type: SearchType) => {
                console.log("Search type changed to:", type);
                setSearchType(type);
              }}
            />
          )}
          
          {searchType === "candidates-at-company" && (
            <CompanyNameInput 
              companyName={companyName} 
              isProcessing={isProcessing}
              onChange={setCompanyName} 
            />
          )}
          
          <ContentTextarea 
            searchText={searchText} 
            isProcessing={isProcessing}
            onTextChange={setSearchText} 
            onFileUpload={handleFileUpload}
            onTextUpdate={setSearchText}
          />
          
          <div className="flex justify-between items-center">
            <input 
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="application/pdf,image/*"
            />
            
            <Button 
              type="submit" 
              disabled={isProcessing || !searchText}
              className="border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {isProcessing ? 'Processing...' : submitButtonText || 'Generate Search String'}
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
