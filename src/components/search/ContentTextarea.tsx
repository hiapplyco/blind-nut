
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoreVertical, Upload, Mic, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaptureWindow } from "./CaptureWindow";
import { useState } from "react";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ContentTextareaProps {
  searchText: string;
  isProcessing: boolean;
  onTextChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onTextUpdate: (text: string) => void;
}

export const ContentTextarea = ({ 
  searchText, 
  isProcessing, 
  onTextChange,
  onFileUpload,
  onTextUpdate
}: ContentTextareaProps) => {
  const isMobile = useIsMobile();
  const [showCaptureWindow, setShowCaptureWindow] = useState(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isContentUpdating, setIsContentUpdating] = useState(false);

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    setIsScrapingUrl(true);
    setShowUrlDialog(false);
    toast.info("Scraping website content...");

    try {
      const result = await FirecrawlService.crawlWebsite(urlInput);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to scrape website");
      }
      
      if (result.data?.text) {
        setIsContentUpdating(true);
        // Small delay for smooth animation
        await new Promise(resolve => setTimeout(resolve, 300));
        onTextUpdate(result.data.text);
        toast.success("Website content scraped successfully!");
      } else {
        throw new Error("No content found on the webpage");
      }
    } catch (error) {
      console.error("URL scraping error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to scrape website");
    } finally {
      setIsScrapingUrl(false);
      setUrlInput("");
      setIsContentUpdating(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[100px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const renderInputActions = () => {
    if (isMobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-md">
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-2 border-black">
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setShowCaptureWindow(true)}
            >
              Record Audio
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setShowUrlDialog(true)}
              disabled={isScrapingUrl}
            >
              Paste URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    const buttonBaseClasses = "inline-flex items-center px-4 py-2 bg-white border-2 border-black rounded font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all min-w-[140px] justify-center h-[40px]";

    return (
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="file-upload"
            className={`${buttonBaseClasses} ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Attach PDF'}
          </label>
        </div>
        <Button
          onClick={() => setShowCaptureWindow(true)}
          className={buttonBaseClasses}
          disabled={isProcessing}
        >
          <Mic className="h-4 w-4 mr-2" />
          Record Audio
        </Button>
        <Button
          onClick={() => setShowUrlDialog(true)}
          className={buttonBaseClasses}
          disabled={isProcessing || isScrapingUrl}
        >
          <Globe className="h-4 w-4 mr-2" />
          {isScrapingUrl ? 'Scraping...' : 'Add URL'}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="searchText" className="text-xl font-bold">Content</Label>
        {renderInputActions()}
      </div>
      <textarea
        id="searchText"
        placeholder="Enter job requirements or paste resume content"
        value={searchText}
        onChange={(e) => onTextChange(e.target.value)}
        className={cn(
          "w-full min-h-[100px] p-4 border-4 border-black rounded bg-white resize-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black transition-all duration-300",
          isContentUpdating && "animate-pulse"
        )}
      />
      <Alert className="bg-muted/50">
        <AlertDescription>
          Note: The URL scraping feature may not work on all websites due to their structure or access restrictions.
          Best results are achieved with public web pages that don't require authentication.
        </AlertDescription>
      </Alert>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={onFileUpload}
        accept="application/pdf,image/*"
      />
      {showCaptureWindow && (
        <CaptureWindow onTextUpdate={(text) => {
          onTextUpdate(text);
          setShowCaptureWindow(false);
        }} />
      )}

      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="sm:max-w-[425px] animate-in fade-in-0 zoom-in-95">
          <DialogHeader>
            <DialogTitle>Add Website URL</DialogTitle>
            <DialogDescription>
              Enter the URL of the website you want to analyze. The content will be processed and added to your search.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUrlDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isScrapingUrl}
              >
                {isScrapingUrl ? 'Processing...' : 'Add Content'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
