import { Bot, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { KeyTermsWindow } from "./KeyTermsWindow";
import { CompensationAnalysis } from "../agents/CompensationAnalysis";
import { JobDescriptionEnhancer } from "../agents/JobDescriptionEnhancer";
import { JobSummary } from "../agents/JobSummary";
import { ExportButton } from "./ExportButton";
import { PDFReport } from "./PDFReport";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import ReactToPdf from "react-to-pdf";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface AnalysisResultsProps {
  jobId: number;
  onClose: () => void;
}

export const AnalysisResults = ({ jobId, onClose }: AnalysisResultsProps) => {
  const { data: agentOutput } = useAgentOutputs(jobId);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExport = async () => {
    if (!agentOutput || !pdfRef.current) return;

    setIsExporting(true);
    try {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', jobId)
        .single();

      const searchString = jobData?.search_string || 'No search string available';

      // Generate PDF options
      const options = {
        filename: `job-analysis-${jobId}.pdf`,
        page: {
          margin: 20,
          format: 'A4'
        }
      };

      // Create a function that returns the target element
      const getTargetElement = () => pdfRef.current;

      // Generate the PDF using the target finder function
      await ReactToPdf(getTargetElement, options);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              Analysis Results
            </h2>
            <div className="flex items-center gap-4">
              <ExportButton onClick={handleExport} isLoading={isExporting} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close results"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeyTermsWindow jobId={jobId} />
            <CompensationAnalysis jobId={jobId} />
            <JobDescriptionEnhancer jobId={jobId} />
            <JobSummary jobId={jobId} />
          </div>
        </Card>
      </div>

      {/* Hidden div for PDF generation */}
      <div className="hidden" ref={pdfRef}>
        {agentOutput && (
          <PDFReport
            jobSummary={agentOutput.job_summary || ''}
            enhancedDescription={agentOutput.enhanced_description || ''}
            compensationAnalysis={agentOutput.compensation_analysis || ''}
            terms={agentOutput.terms}
            searchString=""
          />
        )}
      </div>
    </div>
  );
};