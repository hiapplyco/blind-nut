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
    const processingToast = toast({
      title: "Processing Started",
      description: "Our AI agents are analyzing your content. This usually takes about 30-60 seconds...",
      duration: 5000,
    });

    const processContent = async () => {
      try {
        console.log("Starting content processing for job:", jobId);
        
        // Process terms
        const termsResponse = await supabase.functions.invoke('extract-nlp-terms', { 
          body: { content } 
        });
        
        if (termsResponse.error) throw termsResponse.error;
        console.log("Terms extracted:", termsResponse.data);
        
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
        console.log("Compensation analyzed:", compensationResponse.data);

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
        console.log("Description enhanced:", enhancerResponse.data);

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
        console.log("Summary created:", summaryResponse.data);

        // Store results in Supabase
        const { data: insertData, error: insertError } = await supabase
          .from('agent_outputs')
          .insert({
            job_id: jobId,
            terms: termsResponse.data,
            compensation_analysis: compensationResponse.data?.analysis,
            enhanced_description: enhancerResponse.data?.enhancedDescription,
            job_summary: summaryResponse.data?.summary
          })
          .select()
          .single();

        if (insertError) throw insertError;
        console.log("Agent outputs saved to database:", insertData);

        // Verify the data was saved by attempting to fetch it
        const verifyData = async () => {
          const { data: verificationData } = await supabase
            .from('agent_outputs')
            .select('*')
            .eq('job_id', jobId)
            .maybeSingle();
          
          console.log("Verification fetch result:", verificationData);
          
          if (verificationData) {
            toast({
              title: "Analysis Complete",
              description: "Your report is now ready to view.",
              duration: 5000,
            });
            onComplete();
          } else {
            // If data isn't found, retry after a short delay
            setTimeout(verifyData, 1000);
          }
        };

        // Start verification process
        await verifyData();

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

    return () => {
      processingToast.dismiss();
    };
  }, [content, jobId, onComplete, toast]);

  return null;
};