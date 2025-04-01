
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Upload, Mic, Globe } from "lucide-react";

interface InputActionsProps {
  isMobile: boolean;
  isProcessing: boolean;
  isScrapingUrl: boolean;
  onFileUploadClick: () => void;
  onRecordClick: () => void;
  onUrlClick: () => void;
}

export const InputActions = ({
  isMobile,
  isProcessing,
  isScrapingUrl,
  onFileUploadClick,
  onRecordClick,
  onUrlClick
}: InputActionsProps) => {
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-md">
          <MoreVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border-2 border-black">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={onFileUploadClick}
          >
            Upload File
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={onRecordClick}
          >
            Record Audio
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={onUrlClick}
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
        onClick={onRecordClick}
        className={buttonBaseClasses}
        disabled={isProcessing}
      >
        <Mic className="h-4 w-4 mr-2" />
        Record Audio
      </Button>
      <Button
        onClick={onUrlClick}
        className={buttonBaseClasses}
        disabled={isProcessing || isScrapingUrl}
      >
        <Globe className="h-4 w-4 mr-2" />
        {isScrapingUrl ? 'Scraping...' : 'Add URL'}
      </Button>
    </div>
  );
};
