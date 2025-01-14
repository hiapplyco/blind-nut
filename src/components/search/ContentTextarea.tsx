import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Upload, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaptureWindow } from "./CaptureWindow";
import { useState } from "react";

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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

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
            className={`inline-flex items-center px-4 py-2 bg-white border-2 border-black rounded font-bold 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Attach PDF'}
          </label>
        </div>
        <Button
          onClick={() => setShowCaptureWindow(true)}
          className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
            hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
            transition-all"
          disabled={isProcessing}
        >
          <Mic className="h-4 w-4 mr-2" />
          Record Audio
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
        className="w-full min-h-[100px] p-4 border-4 border-black rounded bg-white resize-none 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
      />
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
    </div>
  );
};