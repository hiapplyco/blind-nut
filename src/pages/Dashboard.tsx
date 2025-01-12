import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

      // Generate titles for searches that don't have one
      const updatedSearches = await Promise.all(data.map(async (search) => {
        if (!search.title && search.content) {
          try {
            const response = await fetch(`${window.location.origin}/functions/v1/summarize-title`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ content: search.content }),
            });

            if (!response.ok) throw new Error('Failed to generate title');
            
            const { title } = await response.json();
            
            // Update the search with the new title
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ title })
              .eq('id', search.id);

            if (updateError) throw updateError;
            
            return { ...search, title };
          } catch (error) {
            console.error('Error generating title:', error);
            toast({
              title: "Error",
              description: "Failed to generate title for search",
              variant: "destructive",
            });
            return search;
          }
        }
        return search;
      }));

      return updatedSearches;
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
                
                {search.agent_outputs?.[0]?.job_summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {search.agent_outputs[0].job_summary}
                  </p>
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