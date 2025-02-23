
import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FirecrawlService } from "@/utils/FirecrawlService";

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
          <div className="space-y-2">
            <Label htmlFor="post-content">What do you want to post about?</Label>
            <Textarea
              id="post-content"
              className="h-40"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Enter your post ideas here..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Your content will be analyzed by 5 experts and a devil's advocate before crafting the final post
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="linkInput"
                type="url"
                placeholder="Add a website URL to analyze (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }} 
                />
                <Globe className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </Label>

              <Button type="submit" disabled={isLoading || isScrapingUrl}>
                {isScrapingUrl ? "Scraping Website..." : isLoading ? "Analyzing & Generating..." : "Generate Post"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LinkedInPostForm;
