
import { forwardRef } from "react";
import { AgentOutput } from "@/types/agent";
import { PDFReport } from "../PDFReport";

interface PDFGeneratorProps {
  agentOutput: AgentOutput | null;
  pdfContent: string;
  isExporting: boolean;
}

export const PDFGenerator = forwardRef<HTMLDivElement, PDFGeneratorProps>(
  ({ agentOutput, pdfContent, isExporting }, ref) => {
    if (!agentOutput) return null;

    return (
      <div 
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          height: 'auto',
          backgroundColor: 'white',
          padding: '2rem',
          visibility: isExporting ? 'visible' : 'hidden',
          opacity: isExporting ? '1' : '0',
        }}
      >
        <PDFReport
          jobSummary={agentOutput.job_summary || ''}
          enhancedDescription={agentOutput.enhanced_description || ''}
          compensationAnalysis={agentOutput.compensation_analysis || ''}
          terms={agentOutput.terms}
          searchString={pdfContent}
        />
      </div>
    );
  }
);

PDFGenerator.displayName = 'PDFGenerator';
