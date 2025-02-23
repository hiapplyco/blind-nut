
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
        <CardDescription>
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

            <Button type="submit" disabled={isLoading || isScrapingUrl}>
              {isScrapingUrl ? "Scraping Website..." : isLoading ? "Analyzing & Generating..." : "Generate Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LinkedInPostForm;
