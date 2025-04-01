
import { useState } from "react";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { toast } from "sonner";

export const useUrlScraping = (onTextUpdate: (text: string) => void) => {
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isContentUpdating, setIsContentUpdating] = useState(false);

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      new URL(urlInput);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    setIsScrapingUrl(true);
    setShowUrlDialog(false);
    toast.info("Analyzing website content...");

    try {
      const result = await FirecrawlService.crawlWebsite(urlInput);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to scrape website");
      }
      
      if (result.data?.text) {
        setIsContentUpdating(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        onTextUpdate(result.data.text);
        toast.success("Website content analyzed successfully!");
      } else {
        throw new Error("No content found on the webpage");
      }
    } catch (error) {
      console.error("URL scraping error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze website");
    } finally {
      setIsScrapingUrl(false);
      setUrlInput("");
      setIsContentUpdating(false);
    }
  };

  return {
    isScrapingUrl,
    showUrlDialog,
    urlInput,
    isContentUpdating,
    setShowUrlDialog,
    setUrlInput,
    handleUrlSubmit
  };
};
