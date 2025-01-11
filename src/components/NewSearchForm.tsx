import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SearchResults from "./SearchResults";
import { processJobRequirements } from "@/utils/jobRequirements";
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
        title: "Processing requirements",
        description: "Please wait while we analyze the content...",
      });

      const result = await processJobRequirements(searchText, searchType);
      setCurrentJobId(result.jobId);

      toast({
        title: "Success",
        description: "Content processed and search string generated.",
      });

      setSearchText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process content. Please try again.",
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

          <p className="text-muted-foreground text-sm text-center mb-4">
            Paste the resume or job, or just type, or do both. We will generate a new search page for you.
          </p>

          <div className="space-y-2">
            <Label htmlFor="searchText">Content</Label>
            <Input
              id="searchText"
              placeholder="Enter job requirements or paste resume content"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !searchText}
          >
            Generate Search
          </Button>
        </form>
      </Card>

      {searchType === 'candidates' && <SearchResults jobId={currentJobId} />}
    </div>
  );
};

export default NewSearchForm;