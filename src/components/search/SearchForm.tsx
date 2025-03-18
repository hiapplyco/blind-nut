
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SearchFormHeader } from "./SearchFormHeader";
import { useSearchForm } from "./hooks/useSearchForm";
import { SearchType, SearchFormProps } from "./types";
import { ContentTextarea } from "./ContentTextarea";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { CompanyNameInput } from "./CompanyNameInput";
import { FileUploadHandler } from "./FileUploadHandler";
import { SubmitButton } from "./SubmitButton";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId,
  isProcessingComplete = false,
  source = 'default',
  hideSearchTypeToggle = false,
  submitButtonText,
  onSubmitStart,
  onShowGoogleSearch 
}: SearchFormProps) => {
  const {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    isProcessing,
    searchType,
    setSearchType,
    searchString,
    setSearchString,
    handleSubmit,
    handleFileUpload
  } = useSearchForm(userId, onJobCreated, currentJobId, source, onSubmitStart);

  const [isInputActive, setIsInputActive] = useState(false);
  const [showSearchString, setShowSearchString] = useState(false);
  const [isFindingProfiles, setIsFindingProfiles] = useState(false);

  // Show search string when it's generated or when processing is complete
  useEffect(() => {
    if (searchString && !isProcessing) {
      setShowSearchString(true);
    }
  }, [searchString, isProcessing]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
  };

  const handleCopySearchString = () => {
    navigator.clipboard.writeText(searchString);
    toast.success("Search string copied to clipboard!");
  };

  const handleFindLinkedInProfiles = async () => {
    if (!searchString) {
      toast.error("No search string available. Please generate a search string first.");
      console.error("Find LinkedIn Profiles attempted without a search string");
      return;
    }

    console.log("Find LinkedIn Profiles button clicked with search string:", searchString);
    setIsFindingProfiles(true);
    
    try {
      if (onShowGoogleSearch) {
        console.log("Calling onShowGoogleSearch with search string");
        onShowGoogleSearch(searchString);
        toast.success("Finding LinkedIn profiles...");
      } else {
        console.error("Cannot show Google search: missing callback function");
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error finding LinkedIn profiles:", error);
      toast.error("Failed to find LinkedIn profiles. Please try again.");
    } finally {
      // Add a small delay to make the animation more noticeable
      setTimeout(() => {
        setIsFindingProfiles(false);
      }, 800);
    }
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
            value={searchType as SearchType} 
            onValueChange={(value) => setSearchType(value as SearchType)} 
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
        
        {showSearchString && searchString && (
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm text-gray-600">Generated Search String:</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySearchString}
                className="hover:bg-gray-200"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="mt-2 font-mono text-sm resize-none focus:ring-2 focus:ring-black"
              rows={4}
            />
            
            {/* Find LinkedIn Profiles button with animation */}
            {searchString && (
              <div className="mt-3">
                <Button 
                  type="button"
                  onClick={handleFindLinkedInProfiles}
                  disabled={isFindingProfiles}
                  className={`w-full border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all duration-300 ${
                    isFindingProfiles ? 'animate-pulse' : ''
                  } transform hover:scale-[1.02] active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]`}
                  variant="secondary"
                >
                  {isFindingProfiles ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding Profiles...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find LinkedIn Profiles
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
        
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
