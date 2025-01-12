import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface SubmitButtonProps {
  isProcessing: boolean;
  isDisabled: boolean;
}

export const SubmitButton = ({ isProcessing, isDisabled }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-[#4F46E5] text-white py-4 rounded font-bold text-lg border-4 
        border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
        hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover" 
      disabled={isDisabled}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin mr-2">
            <Upload className="h-4 w-4" />
          </div>
          Processing...
        </div>
      ) : (
        'Generate Search'
      )}
    </Button>
  );
};