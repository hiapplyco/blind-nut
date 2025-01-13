import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { CompanyNameInput } from "./CompanyNameInput";
import { SubmitButton } from "./SubmitButton";
import { CaptureWindow } from "./CaptureWindow";
import { GoogleSearchWindow } from "./GoogleSearchWindow";
import { useSearchFormSubmit } from "./SearchFormSubmit";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { processJobRequirements } from "@/utils/jobRequirements";

type SearchType = "candidates" | "companies" | "candidates-at-company";

interface SearchFormProps {
  userId: string;
  onJobCreated: (jobId: number, searchText: string) => void;
  currentJobId: number | null;
  isProcessingComplete: boolean;
}

export const SearchForm = ({ 
  userId, 
  onJobCreated, 
  currentJobId,
  isProcessingComplete,
}: SearchFormProps) => {
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrapingProfiles, setIsScrapingProfiles] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [generatedSearchString, setGeneratedSearchString] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast("Invalid file type. Please upload a PDF file or an image");
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
        toast("File processed successfully. The content has been extracted and added to the input field.");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast("Failed to process the file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
      setGeneratedSearchString(result.searchString);

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

  const handleTextUpdate = (text: string) => {
    setSearchText(text);
  };

  return (
    <div className="space-y-6">
      {generatedSearchString && (
        <GoogleSearchWindow searchString={generatedSearchString} />
      )}
      
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
      
      <CaptureWindow onTextUpdate={handleTextUpdate} />
    </div>
  );
};