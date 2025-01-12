import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

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
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
        <h1 className="text-3xl font-bold">Previous Searches</h1>
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
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Search className="h-4 w-4" />
                  <span className="font-medium">
                    {format(new Date(search.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {search.agent_outputs?.[0]?.job_summary && (
                  <div>
                    <h3 className="font-semibold text-lg">
                      {search.content?.substring(0, 60) || 'Untitled Search'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {search.agent_outputs[0].job_summary}
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  navigate(`/?jobId=${search.id}`);
                }}
              >
                <FileText className="h-4 w-4" />
                View Report
              </Button>
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