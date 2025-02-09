
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { PDFGenerator } from "@/components/search/pdf/PDFGenerator";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { SearchCard } from "@/components/dashboard/SearchCard";
import { RunAgainDialog } from "@/components/dashboard/RunAgainDialog";
import type { SearchCardData } from "@/components/dashboard/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [showRunAgainDialog, setShowRunAgainDialog] = useState(false);
  const [selectedJobContent, setSelectedJobContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const { data: searches, isLoading } = useQuery({
    queryKey: ["searches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          agent_outputs!agent_outputs_job_id_fkey (
            job_summary,
            compensation_analysis,
            enhanced_description,
            terms,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SearchCardData[];
    },
  });

  const handleDownloadReport = async (jobId: number) => {
    const { data: agentOutput } = useAgentOutputs(jobId);
    if (!agentOutput || !pdfRef.current) {
      toast.error("No report data available");
      return;
    }

    setIsExporting(true);
    try {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', jobId)
        .single();

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
      pdf.save(`job-analysis-${jobId}.pdf`);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunAgain = async (jobId: number) => {
    try {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('content')
        .eq('id', jobId)
        .single();

      if (jobData?.content) {
        setSelectedJobContent(jobData.content);
        setShowRunAgainDialog(true);
      } else {
        toast.error("No search content found");
      }
    } catch (error) {
      console.error('Error getting job content:', error);
      toast.error("Failed to get job content");
    }
  };

  const handleConfirmRunAgain = () => {
    setIsProcessing(true);
    setShowRunAgainDialog(false);
    
    navigate('/', { 
      state: { 
        content: selectedJobContent, 
        autoRun: true 
      },
      replace: true
    });
    
    toast.success("Generating new report...");
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Past Searches</h1>
        <Button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Search
        </Button>
      </div>

      <div className="grid gap-4">
        {searches?.map((search) => (
          <SearchCard
            key={search.id}
            search={search}
            onDownloadReport={handleDownloadReport}
            onRunAgain={handleRunAgain}
            isProcessing={isProcessing}
          />
        ))}

        {searches?.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No searches yet. Create your first search to get started.</p>
          </Card>
        )}
      </div>

      <RunAgainDialog
        open={showRunAgainDialog}
        onOpenChange={setShowRunAgainDialog}
        selectedJobContent={selectedJobContent}
        onSelectedJobContentChange={setSelectedJobContent}
        onConfirm={handleConfirmRunAgain}
        isProcessing={isProcessing}
      />

      <PDFGenerator
        ref={pdfRef}
        agentOutput={null}
        pdfContent=""
        isExporting={isExporting}
      />
    </div>
  );
};

export default Dashboard;
