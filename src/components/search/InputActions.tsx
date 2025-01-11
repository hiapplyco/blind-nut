import { Button } from "@/components/ui/button";
import { Upload, Video, Mic } from "lucide-react";

interface InputActionsProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isProcessing: boolean;
  onShowAccessDialog: () => void;
}

export const InputActions = ({ onFileUpload, isProcessing, onShowAccessDialog }: InputActionsProps) => {
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
        type="button"
        variant="outline"
        className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
          hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
          transition-all opacity-50 cursor-not-allowed"
        onClick={onShowAccessDialog}
      >
        <Video className="h-4 w-4 mr-2" />
        Record Video
      </Button>
      <Button
        type="button"
        variant="outline"
        className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
          hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
          transition-all opacity-50 cursor-not-allowed"
        onClick={onShowAccessDialog}
      >
        <Mic className="h-4 w-4 mr-2" />
        Record Audio
      </Button>
    </div>
  );
};