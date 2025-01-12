import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { processJobRequirements } from "@/utils/jobRequirements";
import { supabase } from "@/integrations/supabase/client";
import { SearchTypeToggle } from "./SearchTypeToggle";
import { FormHeader } from "./FormHeader";
import { ContentTextarea } from "./ContentTextarea";
import { CompanyNameInput } from "./CompanyNameInput";
import { SubmitButton } from "./SubmitButton";
import { ViewReportButton } from "./ViewReportButton";

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
  const { toast } = useToast();

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

      window.open(`https://www.google.com/search?q=${encodeURIComponent(result.searchString)}`, '_blank');

      toast({
        title: "Search generated",
        description: "Your search has been generated and opened in a new tab.",
      });
    } catch (error) {
      console.error('Error processing content:', error);
      toast({
        title: "Error",
        description: "Failed to process content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file or an image",
        variant: "destructive",
      });
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
        toast({
          title: "File processed",
          description: "The content has been extracted and added to the input field.",
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextUpdate = (text: string) => {
    setSearchText(text);
    toast({
      title: "Audio transcribed",
      description: "The audio has been transcribed and added to the input field.",
    });
  };

  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {currentJobId && isProcessingComplete && (
        <div className="mb-6">
          <ViewReportButton onClick={onViewReport} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <SearchTypeToggle value={searchType} onValueChange={(value) => setSearchType(value)} />
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