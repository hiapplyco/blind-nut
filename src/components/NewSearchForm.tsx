import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import FileUploadField from "./FileUploadField";
import SearchResults from "./SearchResults";
import { processJobRequirements, handleDocumentUpload } from "@/utils/jobRequirements";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Building2 } from "lucide-react";

const NewSearchForm = () => {
  const [searchText, setSearchText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<"candidates" | "companies">("candidates");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      toast({
        title: "Processing job requirements",
        description: "Please wait while we analyze the requirements...",
      });

      const result = await processJobRequirements(searchText, searchType);
      setCurrentJobId(result.jobId);

      toast({
        title: "Success",
        description: "Job requirements processed and results available below.",
      });

      setSearchText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process job requirements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    toast({
      title: "Processing document",
      description: "Please wait while we extract the text...",
    });

    try {
      const text = await handleDocumentUpload(file);
      setSearchText(text);
      
      toast({
        title: "Document processed",
        description: "Text has been extracted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <ToggleGroup
              type="single"
              value={searchType}
              onValueChange={(value) => value && setSearchType(value as "candidates" | "companies")}
              className="justify-center"
            >
              <ToggleGroupItem value="candidates" aria-label="Search for candidates">
                <Users className="h-4 w-4 mr-2" />
                Candidates
              </ToggleGroupItem>
              <ToggleGroupItem value="companies" aria-label="Search for companies">
                <Building2 className="h-4 w-4 mr-2" />
                Companies
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchText">Job Requirements</Label>
            <Input
              id="searchText"
              placeholder="Enter job requirements or upload a document"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <FileUploadField 
            isDisabled={isProcessing}
            onFileUpload={onFileUpload}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !searchText}
          >
            Process Requirements
          </Button>
        </form>
      </Card>

      {searchType === 'candidates' && <SearchResults jobId={currentJobId} />}
    </div>
  );
};

export default NewSearchForm;