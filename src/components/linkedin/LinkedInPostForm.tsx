
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FirecrawlService } from "@/utils/FirecrawlService";
import PromptInput from "./form/PromptInput";
import UrlInput from "./form/UrlInput";

interface LinkedInPostFormProps {
  onSubmit: (content: string, link: string, websiteContent: string) => Promise<void>;
  isLoading: boolean;
  isScrapingUrl: boolean;
}

const LinkedInPostForm = ({ onSubmit, isLoading, isScrapingUrl }: LinkedInPostFormProps) => {
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let websiteContent = "";

    try {
      if (link) {
        toast.info("Scraping website content...");
        const result = await FirecrawlService.crawlWebsite(link);
        
        if (!result.success) {
          throw new Error(result.error || "Failed to scrape website");
        }
        
        websiteContent = result.data?.text || "";
        toast.success("Website content scraped successfully!");
      }

      await onSubmit(postContent, link, websiteContent);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process form. Please try again.");
    }
  };

  return (
    <Card className="border-2 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#8B5CF6]">Create New Post</CardTitle>
        <CardDescription className="text-gray-600">
          Fill in the details below to generate your LinkedIn post with expert analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PromptInput
            postContent={postContent}
            onChange={setPostContent}
          />

          <div className="flex items-center gap-4">
            <UrlInput
              link={link}
              onLinkChange={setLink}
              onFileChange={setFile}
            />

            <Button 
              type="submit" 
              disabled={isLoading || isScrapingUrl}
              className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"
            >
              {isScrapingUrl ? "Scraping Website..." : isLoading ? "Analyzing & Generating..." : "Generate Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LinkedInPostForm;
