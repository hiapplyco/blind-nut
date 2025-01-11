import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentProcessorProps {
  content: string;
  jobId: number;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const AgentProcessor = async ({ content, jobId, onComplete, onError }: AgentProcessorProps) => {
  const { toast } = useToast();

  try {
    // Run all agent functions concurrently
    const [termsResponse, compensationResponse, enhancerResponse, summaryResponse] = await Promise.all([
      supabase.functions.invoke('extract-nlp-terms', { body: { content } }),
      supabase.functions.invoke('analyze-compensation', { body: { content } }),
      supabase.functions.invoke('enhance-job-description', { body: { content } }),
      supabase.functions.invoke('summarize-job', { body: { content } })
    ]);

    // Check for errors
    if (termsResponse.error || compensationResponse.error || enhancerResponse.error || summaryResponse.error) {
      throw new Error("One or more agents failed to process the content");
    }

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

    onComplete();
  } catch (error) {
    console.error('Error in agent processing:', error);
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
};