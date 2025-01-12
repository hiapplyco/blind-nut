import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AnalysisHeader } from "./analysis/AnalysisHeader";
import { AnalysisGrid } from "./analysis/AnalysisGrid";
import { PDFGenerator } from "./pdf/PDFGenerator";

interface AnalysisResultsProps {
  jobId: number;
  onClose: () => void;
}

export const AnalysisResults = ({ jobId, onClose }: AnalysisResultsProps) => {
  const { data: agentOutput } = useAgentOutputs(jobId);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");

  useEffect(() => {
    const fetchJobData = async () => {
      if (!agentOutput) return;
      
      const { data: jobData } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', jobId)
        .single();

      setPdfContent(jobData?.search_string || 'No search string available');
    };

    fetchJobData();
  }, [agentOutput, jobId]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto" 
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-4xl my-8">
        <Card className={cn(
          "bg-[#FFFBF4] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          "animate-scale-in p-6 space-y-6 relative max-h-[85vh] overflow-y-auto"
        )}>
          <AnalysisHeader 
            onClose={onClose}
            onExport={handleExport}
            isExporting={isExporting}
          />
          <AnalysisGrid jobId={jobId} />
        </Card>
      </div>

      {PDFContent}
    </div>
  );
};