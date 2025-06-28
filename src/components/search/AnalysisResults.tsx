
import { KeyTermsWindow } from "./KeyTermsWindow";
import { PDFReport } from "./PDFReport";
import { ViewReportButton } from "./ViewReportButton";

interface AnalysisResultsProps {
  agentOutput: any;
  searchString: string;
  jobId: number;
  onClose?: () => void;
}

export const AnalysisResults = ({ 
  agentOutput, 
  searchString, 
  jobId 
}: AnalysisResultsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyTermsWindow jobId={jobId} />
        <PDFReport jobId={jobId} />
      </div>
      
      <ViewReportButton 
        agentOutput={agentOutput}
        searchString={searchString}
        jobId={jobId}
      />
    </div>
  );
};
