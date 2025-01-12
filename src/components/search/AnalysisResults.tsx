import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AnalysisHeader } from "./analysis/AnalysisHeader";
import { AnalysisGrid } from "./analysis/AnalysisGrid";
import { PDFGenerator } from "./pdf/PDFGenerator";
import { Progress } from "@/components/ui/progress";

interface AnalysisResultsProps {
  jobId: number;
  onClose: () => void;
}

export const AnalysisResults = ({ jobId, onClose }: AnalysisResultsProps) => {
  const { data: agentOutput } = useAgentOutputs(jobId);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Trigger entrance animation after a short delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!agentOutput) return;
      
      setLoadingProgress(25);
      console.log("Loading report: 25%");
      
      const { data: jobData } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', jobId)
        .single();

      setLoadingProgress(50);
      console.log("Loading report: 50%");
      setPdfContent(jobData?.search_string || 'No search string available');
      
      // Simulate loading of report components
      setLoadingProgress(75);
      console.log("Loading report: 75%");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingProgress(100);
      console.log("Loading report: 100%");
      
      // Longer delay before hiding loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    if (agentOutput) {
      fetchJobData();
    }
  }, [agentOutput, jobId]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      // Add a delay before closing to allow exit animation to complete
      setTimeout(onClose, 300);
    }
  };

  const { handleExport, PDFContent } = PDFGenerator({ 
    agentOutput, 
    pdfContent, 
    isExporting, 
    setIsExporting 
  });

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-4xl my-8">
        <Card className={cn(
          "bg-[#FFFBF4] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          "p-6 space-y-6 relative max-h-[85vh] overflow-y-auto",
          "transition-all duration-300 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          {isLoading ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Preparing Analysis Report</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Loading report components
                  </span>
                  <span className="text-sm text-gray-500">
                    {loadingProgress}%
                  </span>
                </div>
                <Progress 
                  value={loadingProgress} 
                  className="h-2"
                  indicatorClassName={
                    loadingProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <AnalysisHeader 
                onClose={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                onExport={handleExport}
                isExporting={isExporting}
              />
              <AnalysisGrid jobId={jobId} />
            </>
          )}
        </Card>
      </div>

      {PDFContent}
    </div>
  );
};