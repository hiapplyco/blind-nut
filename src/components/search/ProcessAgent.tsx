import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProcessAgentProps {
  content: string;
  jobId: number;
  onComplete: () => void;
}

export const ProcessAgent = ({ content, jobId, onComplete }: ProcessAgentProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const processContent = async () => {
      try {
        // Process terms
        const termsResponse = await supabase.functions.invoke('extract-nlp-terms', { 
          body: { content } 
        });
        
        if (termsResponse.error) throw termsResponse.error;
        
        // Process compensation
        const compensationResponse = await supabase.functions.invoke('analyze-compensation', { 
          body: { content } 
        });
        
        if (compensationResponse.error) throw compensationResponse.error;

        // Process job description
        const enhancerResponse = await supabase.functions.invoke('enhance-job-description', { 
          body: { content } 
        });
        
        if (enhancerResponse.error) throw enhancerResponse.error;

        // Process summary
        const summaryResponse = await supabase.functions.invoke('summarize-job', { 
          body: { content } 
        });
        
        if (summaryResponse.error) throw summaryResponse.error;

        // Store results in Supabase
        const { error: insertError } = await supabase
          .from('agent_outputs')
          .insert({
            job_id: jobId,
            terms: termsResponse.data,
            compensation_analysis: compensationResponse.data?.analysis,
            enhanced_description: enhancerResponse.data?.enhancedDescription,
            job_summary: summaryResponse.data?.summary
          });

        if (insertError) throw insertError;

        toast({
          title: "Content processed",
          description: "All agents have completed their analysis.",
        });
        onComplete();
      } catch (error) {
        console.error('Error in agent processing:', error);
        toast({
          title: "Error",
          description: "Failed to process content with agents. " + (error instanceof Error ? error.message : "Unknown error"),
          variant: "destructive",
        });
      }
    };

    processContent();
  }, [content, jobId, onComplete, toast]);

  return null;
};