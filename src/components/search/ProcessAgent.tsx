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
    // Show initial processing toast
    const processingToast = toast({
      title: "Processing Started",
      description: "Our AI agents are analyzing your content. This usually takes about 30-60 seconds...",
      duration: 5000, // Show for 5 seconds
    });

    const processContent = async () => {
      try {
        // Process terms
        const termsResponse = await supabase.functions.invoke('extract-nlp-terms', { 
          body: { content } 
        });
        
        if (termsResponse.error) throw termsResponse.error;
        
        toast({
          title: "Terms Extracted",
          description: "Key terms have been identified.",
          duration: 3000,
        });
        
        // Process compensation
        const compensationResponse = await supabase.functions.invoke('analyze-compensation', { 
          body: { content } 
        });
        
        if (compensationResponse.error) throw compensationResponse.error;

        toast({
          title: "Compensation Analyzed",
          description: "Salary and benefits have been processed.",
          duration: 3000,
        });

        // Process job description
        const enhancerResponse = await supabase.functions.invoke('enhance-job-description', { 
          body: { content } 
        });
        
        if (enhancerResponse.error) throw enhancerResponse.error;

        toast({
          title: "Description Enhanced",
          description: "Job description has been improved.",
          duration: 3000,
        });

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
          title: "Analysis Complete",
          description: "Your report is now ready to view.",
          duration: 5000,
        });
        
        // Ensure we call onComplete after successful processing
        onComplete();
      } catch (error) {
        console.error('Error in agent processing:', error);
        toast({
          title: "Error",
          description: "Failed to process content with agents. " + (error instanceof Error ? error.message : "Unknown error"),
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    processContent();

    // Cleanup function to dismiss the initial toast if component unmounts
    return () => {
      processingToast.dismiss();
    };
  }, [content, jobId, onComplete, toast]);

  return null;
};