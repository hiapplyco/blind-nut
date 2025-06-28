import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { AgentOutput } from "@/types/agent";

interface PDFReportProps {
  jobId: number;
}

export const PDFReport = ({ jobId }: PDFReportProps) => {
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  const handleDownloadPDF = async () => {
    // PDF generation logic would go here
    console.log("Generating PDF report for job:", jobId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading report...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate a comprehensive PDF report with all analysis results.
          </p>
          <Button 
            onClick={handleDownloadPDF}
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
