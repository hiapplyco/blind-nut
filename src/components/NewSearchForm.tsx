import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const NewSearchForm = () => {
  const [searchText, setSearchText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search started",
      description: "We're processing your search request.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
      setIsUploading(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          // Here you would implement the actual text extraction
          // For now, we'll just return the text as is
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
            disabled={isUploading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isUploading || !searchText}>
          Start Search
        </Button>
      </form>
    </Card>
  );
};

export default NewSearchForm;