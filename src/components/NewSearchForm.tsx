import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processJobRequirements } from "@/utils/jobRequirements";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Building2, Briefcase, Upload, Video, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type SearchType = "candidates" | "companies" | "candidates-at-company";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const { toast } = useToast();

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

  const handleRequestAccess = () => {
    window.location.href = "mailto:james@hiapply.co?subject=Request Access to Audio/Video Features";
    setShowAccessDialog(false);
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
            <div className="flex justify-between items-center">
              <Label htmlFor="searchText">Content</Label>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Attach PDF'}
                  </label>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => setShowAccessDialog(true)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Record Video
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => setShowAccessDialog(true)}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Record Audio
                </Button>
              </div>
            </div>
            {isProcessing ? (
              <div className="space-y-3">
                <Skeleton className="h-[100px] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : (
              <Input
                id="searchText"
                placeholder="Enter job requirements or paste resume content"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </div>

          {searchType === "candidates-at-company" && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              {isProcessing ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !searchText || (searchType === "candidates-at-company" && !companyName)}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2">
                  <Upload className="h-4 w-4" />
                </div>
                Processing...
              </div>
            ) : (
              'Generate Search'
            )}
          </Button>
        </form>
      </Card>

      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Access Required</DialogTitle>
            <DialogDescription>
              Audio and video recording features are currently in beta. Please email james@hiapply.co to request access to these features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowAccessDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestAccess}>
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewSearchForm;