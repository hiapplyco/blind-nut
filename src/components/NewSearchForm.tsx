import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewSearchForm = () => {
  const [searchText, setSearchText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      toast({
        title: "Processing job requirements",
        description: "Please wait while we analyze the requirements...",
      });

      const { data, error } = await supabase.functions.invoke('process-job-requirements', {
        body: { content: searchText }
      });

      if (error) throw error;

      // Open new tab with Google search
      const searchString = encodeURIComponent(data.searchString);
      window.open(`https://www.google.com/search?q=${searchString}`, '_blank');

      toast({
        title: "Success",
        description: "Job requirements processed and search opened in new tab.",
      });

      setSearchText("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process job requirements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    toast({
      title: "Processing document",
      description: "Please wait while we extract the text...",
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: formData
      });

      if (error) throw error;

      setSearchText(data.text);
      toast({
        title: "Document processed",
        description: "Text has been extracted successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="fileUpload">Upload Document</Label>
          <Input
            id="fileUpload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isProcessing || !searchText}>
          Process Requirements
        </Button>
      </form>
    </Card>
  );
};

export default NewSearchForm;