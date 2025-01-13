import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnalysisLoadingProps {
  isProcessingComplete: boolean;
  dataReady: boolean;
  onCancel: () => void;
  onViewReport?: () => void;
}

export const AnalysisLoading = ({
  isProcessingComplete,
  dataReady,
  onCancel,
  onViewReport,
}: AnalysisLoadingProps) => {
  if (!isProcessingComplete || !dataReady) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Analysis Complete</h3>
          <p className="text-gray-600">
            Your analysis report is ready to view
          </p>
          <Button 
            onClick={onViewReport}
            className="w-full border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            View Analysis Report
          </Button>
        </div>
      </Card>
    </div>
  );
};