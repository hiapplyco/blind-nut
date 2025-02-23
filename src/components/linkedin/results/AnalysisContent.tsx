
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
      <div className="p-4 text-center text-muted-foreground">
        Analysis not available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <Collapsible open={isAnalysisOpen} onOpenChange={onAnalysisOpenChange}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Expert Analysis Details</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isAnalysisOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <pre className="whitespace-pre-wrap text-xs font-mono overflow-auto max-h-96">
              {analysis}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AnalysisContent;
