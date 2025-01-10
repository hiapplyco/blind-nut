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

      toast({
        title: "Success",
        description: "Job requirements have been processed and stored.",
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
      const text = await extractTextFromFile(file);
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

  const extractTextFromFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          resolve(content as string);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
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