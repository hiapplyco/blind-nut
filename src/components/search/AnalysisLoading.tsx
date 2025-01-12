import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnalysisLoadingProps {
  isProcessingComplete: boolean;
  dataReady: boolean;
  onCancel: () => void;
}

export const AnalysisLoading = ({
  isProcessingComplete,
  dataReady,
  onCancel,
}: AnalysisLoadingProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="space-y-2 flex-grow">
            <h3 className="text-xl font-bold">Analysis in Progress</h3>
            <p className="text-gray-600">
              Our AI agents are analyzing your content. This process typically takes 30-60 seconds...
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
        <Button 
          variant="outline"
          className="mt-4 w-full border-2 border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCancel}
          disabled={isProcessingComplete && !dataReady}
        >
          Cancel Analysis
        </Button>
      </Card>
    </div>
  );
};