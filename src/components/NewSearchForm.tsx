import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processJobRequirements } from "@/utils/jobRequirements";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Building2, Briefcase } from "lucide-react";

type SearchType = "candidates" | "companies" | "candidates-at-company";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      toast({
        title: "Processing requirements",
        description: "Please wait while we analyze the content...",
      });

      const result = await processJobRequirements(searchText, searchType, companyName, userId);

      toast({
        title: "Success",
        description: "Content processed and search string generated.",
      });

      setSearchText("");
      setCompanyName("");
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
              onValueChange={(value) => value && setSearchType(value as SearchType)}
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
              <ToggleGroupItem value="candidates-at-company" aria-label="Search for candidates at company">
                <Briefcase className="h-4 w-4 mr-2" />
                Candidates at Company
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

          {searchType === "candidates-at-company" && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !searchText || (searchType === "candidates-at-company" && !companyName)}
          >
            Generate Search
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default NewSearchForm;