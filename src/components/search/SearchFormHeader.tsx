
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchType } from "./types";

interface SearchFormHeaderProps {
  currentJobId: number | null;
  isProcessingComplete: boolean;
  hasAgentOutput: boolean;
  onViewReport: () => void;
}

export const SearchFormHeader = ({ 
  currentJobId, 
  isProcessingComplete, 
  hasAgentOutput,
  onViewReport 
}: SearchFormHeaderProps) => {
  if (!currentJobId || !isProcessingComplete || !hasAgentOutput) return null;

  return (
    <div className="mb-6">
      <Button
        type="button"
        onClick={onViewReport}
        className="w-full border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <Bot className="w-5 h-5 mr-2" />
        View Analysis Report
      </Button>
    </div>
  );
};
