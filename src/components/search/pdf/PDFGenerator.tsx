import { useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
      pdf.save(`job-analysis-${agentOutput.job_id}.pdf`);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return {
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