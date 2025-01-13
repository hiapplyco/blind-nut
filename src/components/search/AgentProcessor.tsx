import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { useMutation } from "@tanstack/react-query";
import { ProcessingProgress } from "./ProcessingProgress";
import { PROCESSING_STEPS, ERROR_MESSAGES } from "./constants/processingSteps";

interface AgentProcessorProps {
  content: string;
  jobId: number;
  onComplete: () => void;
}

export const AgentProcessor = ({ content, jobId, onComplete }: AgentProcessorProps) => {
  const { toast } = useToast();
  const { setOutput } = useClientAgentOutputs();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = PROCESSING_STEPS[currentStepIndex];

  const processStep = async (
    functionName: string, 
    responseKey: string,
  ): Promise<any> => {
    try {
      console.log(`Starting ${functionName} processing...`);
      
      const response = await supabase.functions.invoke(functionName, { 
        body: { content } 
      });
      
      if (response.error) throw response.error;
      console.log(`${functionName} response:`, response.data);
      
      setCurrentStepIndex(prev => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
      return response.data[responseKey];
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      toast({
        title: "Error",
        description: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
        variant: "destructive",
      });
      throw error;
    }
  };

  const persistToDatabase = useMutation({
    mutationFn: async (agentOutput: any) => {
      console.log('Persisting agent output to database:', agentOutput);
      
      const { error } = await supabase
        .from('agent_outputs')
        .insert({
          job_id: jobId,
          terms: agentOutput.terms,
          compensation_analysis: agentOutput.compensationData,
          enhanced_description: agentOutput.enhancerData,
          job_summary: agentOutput.summaryData
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error persisting to database:', error);
      toast({
        title: "Error",
        description: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
        variant: "destructive",
      });
    },
    onSuccess: () => {
      console.log('Successfully persisted agent output to database');
      toast({
        title: "Success",
        description: "Your purple squirrel report is ready! 🐿️",
      });
      onComplete();
    }
  });

  useEffect(() => {
    let isMounted = true;

    const processContent = async () => {
      try {
        // Extract terms
        const terms = await processStep('extract-nlp-terms', 'terms');
        if (!isMounted) return;
        
        // Analyze compensation
        const compensationData = await processStep('analyze-compensation', 'analysis');
        if (!isMounted) return;
        
        // Enhance description
        const enhancerData = await processStep('enhance-job-description', 'enhancedDescription');
        if (!isMounted) return;
        
        // Generate summary
        const summaryData = await processStep('summarize-job', 'summary');
        if (!isMounted) return;

        const agentOutput = {
          id: Date.now(),
          job_id: jobId,
          created_at: new Date().toISOString(),
          terms,
          compensation_analysis: compensationData,
          enhanced_description: enhancerData,
          job_summary: summaryData
        };

        setOutput(jobId, agentOutput);
        console.log('Set client-side agent output:', agentOutput);
        
        await persistToDatabase.mutateAsync({
          terms,
          compensationData,
          enhancerData,
          summaryData
        });

      } catch (error) {
        console.error('Error in agent processing:', error);
        if (!isMounted) return;
        
        toast({
          title: "Error",
          description: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
          variant: "destructive",
        });
      }
    };

    processContent();
    return () => {
      isMounted = false;
    };
  }, [content, jobId]);

  return (
    <ProcessingProgress 
      message={currentStep.message}
      progress={currentStep.progress}
      isComplete={currentStepIndex === PROCESSING_STEPS.length - 1}
    />
  );
};