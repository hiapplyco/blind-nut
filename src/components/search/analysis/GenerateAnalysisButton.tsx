import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface GenerateAnalysisButtonProps {
  onClick: () => void;
}

export const GenerateAnalysisButton = ({ onClick }: GenerateAnalysisButtonProps) => {
  return (
    <div className="mt-8 flex justify-center">
      <Button
        onClick={onClick}
        className="border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <FileText className="w-5 h-5 mr-2" />
        Generate Analysis Report
      </Button>
    </div>
  );
};