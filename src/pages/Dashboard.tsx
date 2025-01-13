import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, PlusCircle, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { PDFGenerator } from "@/components/search/pdf/PDFGenerator";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

const Dashboard = () => {
  const navigate = useNavigate();
  
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

      // Generate titles for searches that don't have one
      const updatedSearches = await Promise.all(data.map(async (search) => {
        if (!search.title && search.content) {
          try {
            const { data: titleData, error: titleError } = await supabase.functions.invoke('summarize-title', {
              body: { content: search.content }
            });

            if (titleError) throw titleError;
            
            // Update the search with the new title
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ 
                title: titleData.title,
                summary: titleData.summary 
              })
              .eq('id', search.id);

            if (updateError) throw updateError;
            
            return { ...search, title: titleData.title, summary: titleData.summary };
          } catch (error) {
            console.error('Error generating title:', error);
            toast.error("Failed to generate title for search");
            return search;
          }
        }
        return search;
      }));

      return updatedSearches;
    },
  });

  const handleDownloadReport = async (jobId: number) => {
    const { data: agentOutput } = useAgentOutputs(jobId);
    if (!agentOutput) {
      toast.error("No report data available");
      return;
    }

    try {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('search_string')
        .eq('id', jobId)
        .single();

      const { handleExport } = PDFGenerator({ 
        agentOutput, 
        pdfContent: jobData?.search_string || '', 
        isExporting: false, 
        setIsExporting: () => {} 
      });

      await handleExport();
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
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
        navigate('/', { state: { content: jobData.content, autoRun: true } });
      }
    } catch (error) {
      console.error('Error running search again:', error);
      toast.error("Failed to run search again");
    }
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
          <Card key={search.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Search className="h-4 w-4" />
                    <span className="font-medium">
                      {format(new Date(search.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-semibold">
                    {search.title || "Untitled Search"}
                  </h2>
                  
                  {search.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {search.summary}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleDownloadReport(search.id)}
                  >
                    <FileText className="h-4 w-4" />
                    Download Report
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleRunAgain(search.id)}
                  >
                    <RotateCw className="h-4 w-4" />
                    Run Again
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {searches?.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No searches yet. Create your first search to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;