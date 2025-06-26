
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const defaultText = 'Generate AI Search String';
  const displayText = buttonText || defaultText;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="submit" 
            disabled={isDisabled}
            className="relative w-full md:w-auto border-2 border-black bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-semibold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:scale-[1.02] active:scale-[0.98] px-6 py-2.5"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span>{displayText}</span>
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
          <p className="text-sm font-medium">AI-Powered Search Generation</p>
          <p className="text-xs text-gray-300 mt-1">
            Our AI analyzes your input and generates an optimized boolean search string for finding the best candidates on LinkedIn
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
