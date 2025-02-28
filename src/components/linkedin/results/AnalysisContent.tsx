
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AnalysisContentProps {
  analysis: string;
  isAnalysisOpen: boolean;
  onAnalysisOpenChange: (open: boolean) => void;
}

const AnalysisContent = ({ analysis, isAnalysisOpen, onAnalysisOpenChange }: AnalysisContentProps) => {
  if (!analysis) {
    return (
      <div className="p-4 text-center text-gray-500">
        Analysis not available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#FEF7CD] p-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
        <Collapsible open={isAnalysisOpen} onOpenChange={onAnalysisOpenChange}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">Expert Analysis Details</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="shadow-none border-0">
                {isAnalysisOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="animate-accordion-down">
            <pre className="whitespace-pre-wrap text-xs font-mono overflow-auto max-h-96 bg-white p-3 rounded border border-black">
              {analysis}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AnalysisContent;
