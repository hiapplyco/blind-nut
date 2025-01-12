import { Card } from "@/components/ui/card";
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
      
      setLoadingProgress(75);
      console.log("Loading report: 75%");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoadingProgress(100);
      console.log("Loading report: 100%");
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };

    if (agentOutput) {
      fetchJobData();
    }
  }, [agentOutput, jobId]);

  const { handleExport, PDFContent } = PDFGenerator({ 
    agentOutput, 
    pdfContent, 
    isExporting, 
    setIsExporting 
  });

  return (
    <Card className="bg-[#FFFBF4] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Generating Analysis Report</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Preparing report components
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
            onClose={onClose}
            onExport={handleExport}
            isExporting={isExporting}
          />
          <AnalysisGrid jobId={jobId} />
        </>
      )}
      {PDFContent}
    </Card>
  );
};