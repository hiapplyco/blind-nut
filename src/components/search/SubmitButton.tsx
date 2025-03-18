
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isProcessing: boolean;
  isDisabled: boolean;
  buttonText?: string;
}

export const SubmitButton = ({ 
  isProcessing, 
  isDisabled,
  buttonText
}: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isDisabled}
      className="w-full md:w-auto border-2 border-black bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
    >
      {isProcessing ? (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </div>
      ) : (
        buttonText || 'Generate Search String'
      )}
    </Button>
  );
};
