import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SearchFormHeader } from "./SearchFormHeader";
import { useSearchForm } from "./hooks/useSearchForm";
import { SearchType, SearchFormProps } from "./types";
import { ContentTextarea } from "./ContentTextarea";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { CompanyNameInput } from "./CompanyNameInput";
// Assuming handleFileUpload from the hook is sufficient, FileUploadHandler component might be removable later
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
  onShowGoogleSearch // Prop to trigger showing Google Search results
}: SearchFormProps) => {
  const {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    isProcessing,
    searchType,
    setSearchType,
    searchString, // The generated search string from the hook
    setSearchString, // Function to update the search string state in the hook
    handleSubmit,
    handleFileUpload // Use the file upload handler from the hook
  } = useSearchForm(userId, onJobCreated, currentJobId, source, onSubmitStart);

  const [isInputActive, setIsInputActive] = useState(false);
  const [showSearchString, setShowSearchString] = useState(false);
  const [isFindingProfiles, setIsFindingProfiles] = useState(false);

  // Show search string when it's generated or when processing is complete
  useEffect(() => {
    // Show the search string section if a search string exists and processing isn't active
    if (searchString && !isProcessing) {
      setShowSearchString(true);
    }
    // Optionally hide if processing starts again or searchString is cleared
    // else {
    //   setShowSearchString(false);
    // }
  }, [searchString, isProcessing]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission if needed, then call hook's handleSubmit
    e.preventDefault();
    await handleSubmit(e);
  };

  const handleCopySearchString = () => {
    if (!searchString) return; // Guard against copying empty string
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
        // Pass the generated search string to the parent component
        onShowGoogleSearch(searchString);
        toast.info("Finding LinkedIn profiles..."); // Use info level
      } else {
        console.error("Cannot show Google search: onShowGoogleSearch callback is missing");
        toast.error("Configuration error. Cannot initiate profile search.");
      }
    } catch (error) {
      console.error("Error triggering LinkedIn profile search:", error);
      toast.error("Failed to start LinkedIn profile search. Please try again.");
    } finally {
      // Add a small delay to make the animation more noticeable
      setTimeout(() => {
        setIsFindingProfiles(false);
      }, 800);
    }
  };

  // Use the file upload handler directly from the hook
  const fileUploadHandler = handleFileUpload;

  return (
    <Card className="p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <SearchFormHeader isProcessingComplete={isProcessingComplete} />

        {!hideSearchTypeToggle && (
          <SearchTypeToggle
            value={searchType as SearchType} // Cast to SearchType
            onValueChange={(value) => setSearchType(value as SearchType)} // Cast to SearchType
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

        {/* Display generated search string and Find Profiles button */}
        {showSearchString && searchString && (
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm text-gray-600">Generated Search String:</h3>
              <Button
                type="button" // Ensure it doesn't submit the form
                variant="ghost"
                size="sm"
                onClick={handleCopySearchString}
                className="hover:bg-gray-200"
                aria-label="Copy search string"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)} // Allow editing if needed
              className="mt-2 font-mono text-sm resize-none focus:ring-2 focus:ring-black"
              rows={4}
              readOnly={false} // Or true if it shouldn't be editable
              aria-label="Generated search string"
            />

            {/* Find LinkedIn Profiles button with animation */}
            <div className="mt-3">
              <Button
                type="button" // Ensure it doesn't submit the form
                onClick={handleFindLinkedInProfiles}
                disabled={isFindingProfiles || !searchString} // Disable if no string or already finding
                className={`w-full border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all duration-300 ${
                  isFindingProfiles ? 'animate-pulse' : ''
                } transform hover:scale-[1.02] active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]`}
                variant="secondary" // Keep variant if styled appropriately
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
          </div>
        )}

        {/* File Upload and Submit Button Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
          {/* File Upload Input */}
          <div>
            <label htmlFor="file-upload-searchform" className="cursor-pointer"> {/* Unique ID */}
              <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                {/* Hidden actual file input */}
                <input
                  id="file-upload-searchform" // Unique ID
                  type="file"
                  className="hidden"
                  onChange={fileUploadHandler} // Use handler from hook
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  disabled={isProcessing} // Disable while processing
                />
                {/* Visible text/label */}
                <span className="underline">Upload file</span>
                <span className="text-xs text-gray-500">(PDF, Doc, Image)</span>
              </div>
            </label> {/* Correct closing tag */}
          </div>

          {/* Submit Button */}
          <SubmitButton
            isProcessing={isProcessing}
            isDisabled={isProcessing || !searchText.trim()} // Disable if processing or text is empty
            buttonText={submitButtonText} // Use prop for custom text
          />
        </div>
      </form>
    </Card>
  );
};
