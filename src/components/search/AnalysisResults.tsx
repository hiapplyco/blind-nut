import { Card } from "@/components/ui/card";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { AnalysisHeader } from "./analysis/AnalysisHeader";
import { AnalysisGrid } from "./analysis/AnalysisGrid";
import { PDFGenerator } from "./pdf/PDFGenerator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface AnalysisResultsProps {
  jobId: number;
  onClose: () => void;
}

export const AnalysisResults = ({ jobId, onClose }: AnalysisResultsProps) => {
  const { data: agentOutput, isLoading: isLoadingOutput } = useAgentOutputs(jobId);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!agentOutput) return;
      
      try {
        setLoadingProgress(25);
        console.log("Loading report: 25%");
        
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('search_string')
          .eq('id', jobId)
          .single();

        if (error) throw error;

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
      } catch (error) {
        console.error('Error fetching job data:', error);
        toast.error("Failed to load report data");
        setIsLoading(false);
      }
    };

    if (agentOutput) {
      fetchJobData();
    }
  }, [agentOutput, jobId]);

  const handleExportWrapper = async () => {
    if (!agentOutput || !pdfRef.current) {
      toast.error("No report data available");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`job-analysis-${jobId}.pdf`);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingOutput) {
    return (
      <Card className="bg-[#FFFBF4] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Loading Analysis Data...</h3>
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

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
            onExport={handleExportWrapper}
            isExporting={isExporting}
          />
          <AnalysisGrid jobId={jobId} />
        </>
      )}
      <PDFGenerator
        ref={pdfRef}
        agentOutput={agentOutput}
        pdfContent={pdfContent}
        isExporting={isExporting}
      />
    </Card>
  );
};