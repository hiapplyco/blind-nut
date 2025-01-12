import { useRef, useEffect } from "react";
import ReactToPdf from "react-to-pdf";
import { PDFReport } from "../PDFReport";
import { AgentOutput } from "@/types/agent";
import { toast } from "sonner";

interface PDFGeneratorProps {
  agentOutput: AgentOutput | null;
  pdfContent: string;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}

export const PDFGenerator = ({ 
  agentOutput, 
  pdfContent, 
  isExporting, 
  setIsExporting 
}: PDFGeneratorProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!agentOutput || !pdfRef.current) return;

    setIsExporting(true);
    try {
      const options = {
        filename: `job-analysis-${agentOutput.job_id}.pdf`,
        page: {
          margin: 20,
          format: 'A4'
        },
        overrides: {
          pdf: {
            compress: false,
            scale: 1,
            useCORS: true,
            background: true,
          },
          canvas: {
            useCORS: true,
            scale: 2,
          },
        },
      };

      const getTargetElement = () => pdfRef.current;

      if (pdfRef.current) {
        pdfRef.current.style.position = 'absolute';
        pdfRef.current.style.visibility = 'visible';
        pdfRef.current.style.opacity = '1';
        pdfRef.current.style.zIndex = '-1000';
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await ReactToPdf(getTargetElement, options);
      
      if (pdfRef.current) {
        pdfRef.current.style.position = 'fixed';
        pdfRef.current.style.visibility = 'hidden';
        pdfRef.current.style.opacity = '0';
      }

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    pdfRef,
    handleExport,
    PDFContent: (
      <div 
        ref={pdfRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          height: 'auto',
          backgroundColor: 'white',
          padding: '2rem',
          visibility: 'hidden',
          opacity: '0',
        }}
      >
        {agentOutput && (
          <PDFReport
            jobSummary={agentOutput.job_summary || ''}
            enhancedDescription={agentOutput.enhanced_description || ''}
            compensationAnalysis={agentOutput.compensation_analysis || ''}
            terms={agentOutput.terms}
            searchString={pdfContent}
          />
        )}
      </div>
    )
  };
};