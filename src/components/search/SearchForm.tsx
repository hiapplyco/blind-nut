import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { CompanyNameInput } from "./CompanyNameInput";
import { SubmitButton } from "./SubmitButton";
import { SearchFormHeader } from "./SearchFormHeader";
import { FileUploadHandler } from "./FileUploadHandler";
import { useSearchFormSubmit } from "./SearchFormSubmit";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

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
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const { data: agentOutput } = useAgentOutputs(currentJobId);

  const handleFileUpload = FileUploadHandler({ 
    userId, 
    onTextUpdate: setSearchText,
    onProcessingChange: setIsProcessing 
  });

  const handleSubmit = useSearchFormSubmit({
    userId,
    searchText,
    searchType,
    companyName,
    onJobCreated,
    onProcessingChange: setIsProcessing
  });

  const handleTextUpdate = (text: string) => {
    setSearchText(text);
  };

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <SearchFormHeader
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
        hasAgentOutput={!!agentOutput}
        onViewReport={onViewReport}
      />
      
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

        <SubmitButton 
          isProcessing={isProcessing}
          isDisabled={isProcessing || !searchText || (searchType === "candidates-at-company" && !companyName)}
        />
      </form>
    </Card>
  );
};