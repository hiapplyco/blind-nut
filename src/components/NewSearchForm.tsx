import { useState } from "react";
import { SearchForm } from "./search/SearchForm";
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { PDFGenerator } from "./search/pdf/PDFGenerator";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { data: agentOutput } = useAgentOutputs(currentJobId);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    setCurrentJobId(jobId);
    setIsProcessingComplete(false);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    setIsProcessingComplete(true);
    toast.success("Analysis complete! Click 'Download Report' to save the results.");
  };

  const handleDownloadReport = async () => {
    if (!currentJobId || !agentOutput || !pdfRef.current) {
      toast.error("No report data available");
      return;
    }

    setIsExporting(true);
    try {
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', currentJobId)
        .single();

      if (error) throw error;

      if (!jobData) {
        toast.error("Search data not found");
        return;
      }

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

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`job-analysis-${currentJobId}.pdf`);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
      />
      
      {currentJobId && !isProcessingComplete && (
        <AgentProcessor
          content={searchText}
          jobId={currentJobId}
          onComplete={handleProcessingComplete}
        />
      )}

      {isProcessingComplete && (
        <Button
          onClick={handleDownloadReport}
          disabled={isExporting}
          className="w-full border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          {isExporting ? 'Downloading...' : 'Download Analysis Report'}
        </Button>
      )}

      <PDFGenerator
        ref={pdfRef}
        agentOutput={agentOutput}
        pdfContent={searchText}
        isExporting={isExporting}
      />
    </div>
  );
};

export default NewSearchForm;