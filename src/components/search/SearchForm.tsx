
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchFormHeader } from "./SearchFormHeader";
import { useSearchForm } from "./hooks/useSearchForm";
import { SearchType, SearchFormProps } from "./types";
import { ContentTextarea } from "./ContentTextarea";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { CompanyNameInput } from "./CompanyNameInput";
import { FileUploadHandler } from "./FileUploadHandler";
import { SubmitButton } from "./SubmitButton";

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId,
  isProcessingComplete = false,
  source = 'default',
  hideSearchTypeToggle = false,
  submitButtonText,
  onSubmitStart 
}: SearchFormProps) => {
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

  const [isInputActive, setIsInputActive] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (onSubmitStart) {
      onSubmitStart();
    }
    await handleSubmit(e);
  };

  // Generate file upload handler function
  const fileUploadHandler = FileUploadHandler({
    userId,
    onTextUpdate: setSearchText,
    onProcessingChange: (isProcessing) => {
      // This function is intentionally left empty for now
      // We might want to handle processing state changes differently in the future
    }
  });

  return (
    <Card className="p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <SearchFormHeader isProcessingComplete={isProcessingComplete} />
        
        {!hideSearchTypeToggle && (
          <SearchTypeToggle 
            value={searchType} 
            onValueChange={setSearchType} 
          />
        )}
        
        {searchType === "candidates-at-company" && (
          <CompanyNameInput 
            companyName={companyName} 
            onChange={setCompanyName}
            isProcessing={isProcessing}
          />
        )}
        
        <ContentTextarea 
          content={searchText}
          onChange={setSearchText}
          placeholder="Paste job description or requirements here..."
          onFocus={() => setIsInputActive(true)}
          onBlur={() => setIsInputActive(false)}
          isActive={isInputActive}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={fileUploadHandler}
                  accept=".pdf,.doc,.docx,.txt,image/*"
                />
                <span className="underline">Upload file</span>
                <span className="text-xs text-gray-500">(PDF, Doc, Image)</span>
              </div>
            </label>
          </div>
          
          <SubmitButton 
            isProcessing={isProcessing} 
            isDisabled={isProcessing || !searchText.trim()}
            buttonText={submitButtonText}
          />
        </div>
      </form>
    </Card>
  );
};
