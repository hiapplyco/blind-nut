import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processJobRequirements } from "@/utils/jobRequirements";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchTypeToggle } from "./search/SearchTypeToggle";
import { InputActions } from "./search/InputActions";
import { KeyTermsWindow } from "./search/KeyTermsWindow";
import { CompensationAnalysis } from "./agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "./agents/JobDescriptionEnhancer";
import { JobSummary } from "./agents/JobSummary";
import { AgentProcessor } from "./search/AgentProcessor";
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
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // First, create the job entry
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
      setCurrentJobId(jobId);

      // Generate search string
      const result = await processJobRequirements(searchText, searchType, companyName, userId);

      // Update job with search string
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ search_string: result.searchString })
        .eq('id', jobId);

      if (updateError) throw updateError;

      // Open search in new window
      const searchString = encodeURIComponent(result.searchString);
      window.open(`https://www.google.com/search?q=${searchString}`, '_blank');

      // Process the content with agents
      await new Promise((resolve, reject) => {
        const agentProcessor = (
          <AgentProcessor
            content={searchText}
            jobId={jobId}
            onComplete={() => {
              toast({
                title: "Content processed",
                description: "All agents have completed their analysis.",
              });
              resolve(null);
            }}
            onError={(error) => {
              toast({
                title: "Error",
                description: "Failed to process content with agents. " + error.message,
                variant: "destructive",
              });
              reject(error);
            }}
          />
        );
        // Render the AgentProcessor component
        document.getElementById('agent-processor-container')?.appendChild(
          document.createElement('div')
        ).appendChild(agentProcessor as any);
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

  const handleRequestAccess = () => {
    window.location.href = "mailto:james@hiapply.co?subject=Request Access to Audio/Video Features";
    setShowAccessDialog(false);
  };

  const handleTextUpdate = (text: string) => {
    setSearchText(text);
    toast({
      title: "Audio transcribed",
      description: "The audio has been transcribed and added to the input field.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SearchTypeToggle value={searchType} onValueChange={(value) => setSearchType(value)} />

          <p className="text-gray-600 text-center mb-4 text-lg">
            Paste the resume or job, or just type, or do both. We will generate a new search page for you.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="searchText" className="text-xl font-bold">Content</Label>
              <InputActions
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
                onShowAccessDialog={() => setShowAccessDialog(true)}
                onTextUpdate={handleTextUpdate}
              />
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
              <textarea
                id="searchText"
                placeholder="Enter job requirements or paste resume content"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full min-h-[100px] p-4 border-4 border-black rounded bg-white resize-none 
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
              />
            )}
          </div>

          {searchType === "candidates-at-company" && (
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xl font-bold">Company Name</Label>
              {isProcessing ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                    focus:ring-0 focus:border-black"
                />
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#8B5CF6] text-white py-4 rounded font-bold text-lg border-4 
              border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
              hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isProcessing || !searchText || (searchType === "candidates-at-company" && !companyName)}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
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

      <div id="agent-processor-container" />

      {currentJobId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KeyTermsWindow jobId={currentJobId} />
          <CompensationAnalysis jobId={currentJobId} />
          <JobDescriptionEnhancer jobId={currentJobId} />
          <JobSummary jobId={currentJobId} />
        </div>
      )}

      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle>Feature Access Required</DialogTitle>
            <DialogDescription>
              Audio and video recording features are currently in beta. Please email james@hiapply.co to request access to these features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAccessDialog(false)}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestAccess}
              className="bg-[#8B5CF6] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewSearchForm;