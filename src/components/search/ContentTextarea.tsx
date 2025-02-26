
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { CaptureWindow } from "./CaptureWindow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { InputActions } from "./InputActions";
import { UrlDialog } from "./UrlDialog";
import { useUrlScraping } from "./hooks/useUrlScraping";

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
  
  const {
    isScrapingUrl,
    showUrlDialog,
    urlInput,
    isContentUpdating,
    setShowUrlDialog,
    setUrlInput,
    handleUrlSubmit
  } = useUrlScraping(onTextUpdate);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onTextChange(newValue);
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="searchText" className="text-xl font-bold">Content</Label>
        <InputActions 
          isMobile={isMobile}
          isProcessing={isProcessing}
          isScrapingUrl={isScrapingUrl}
          onFileUploadClick={() => document.getElementById('file-upload')?.click()}
          onRecordClick={() => setShowCaptureWindow(true)}
          onUrlClick={() => setShowUrlDialog(true)}
        />
      </div>
      <textarea
        id="searchText"
        placeholder="Enter job requirements or paste resume content"
        value={searchText}
        onChange={handleTextChange}
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

      <UrlDialog 
        showDialog={showUrlDialog}
        urlInput={urlInput}
        isScrapingUrl={isScrapingUrl}
        onClose={() => setShowUrlDialog(false)}
        onUrlChange={setUrlInput}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
};
