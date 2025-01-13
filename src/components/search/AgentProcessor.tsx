import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useClientAgentOutputs } from "@/stores/useClientAgentOutputs";
import { useMutation } from "@tanstack/react-query";

interface AgentProcessorProps {
  content: string;
  jobId: number;
  onComplete: () => void;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
}

export const AgentProcessor = ({ content, jobId, onComplete }: AgentProcessorProps) => {
  const { toast } = useToast();
  const { setOutput } = useClientAgentOutputs();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { name: "Creating X-Ray Search", status: 'pending', progress: 0 },
    { name: "Analyzing Compensation", status: 'pending', progress: 0 },
    { name: "Enhancing Description", status: 'pending', progress: 0 },
    { name: "Creating Summary", status: 'pending', progress: 0 }
  ]);

  const updateStepStatus = (index: number, status: ProcessingStep['status'], progress: number) => {
    setSteps(currentSteps => 
      currentSteps.map((step, i) => 
        i === index ? { ...step, status, progress } : step
      )
    );
  };

  const processStep = async (
    index: number, 
    functionName: string, 
    responseKey: string
  ): Promise<any> => {
    try {
      console.log(`Starting ${functionName} processing...`);
      updateStepStatus(index, 'processing', 25);
      
      const response = await supabase.functions.invoke(functionName, { 
        body: { content } 
      });
      
      if (response.error) {
        console.error(`Error in ${functionName}:`, response.error);
        throw response.error;
      }

      console.log(`${functionName} response:`, response.data);
      console.log(`${functionName} completed successfully`);
      updateStepStatus(index, 'complete', 100);
      
      return response.data[responseKey];
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      updateStepStatus(index, 'error', 0);
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
        description: "Failed to save analysis results. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      console.log('Successfully persisted agent output to database');
      toast({
        title: "Analysis Complete",
        description: "Your report is ready to view",
      });
      onComplete();
    }
  });

  useEffect(() => {
    let isMounted = true;

    const processContent = async () => {
      try {
        console.log('Starting content processing...');
        const terms = await processStep(0, 'extract-nlp-terms', 'terms');
        if (!isMounted) return;
        
        const compensationData = await processStep(1, 'analyze-compensation', 'analysis');
        if (!isMounted) return;
        
        const enhancerData = await processStep(2, 'enhance-job-description', 'enhancedDescription');
        if (!isMounted) return;
        
        const summaryData = await processStep(3, 'summarize-job', 'summary');
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
          description: "Failed to process content. Please try again.",
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
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Analyzing Content</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {step.name}
                </span>
                <span className="text-sm text-gray-500">
                  {step.status === 'complete' ? '100%' : 
                   step.status === 'error' ? 'Error' :
                   step.status === 'processing' ? 'Processing...' : 
                   'Pending'}
                </span>
              </div>
              <Progress 
                value={step.progress} 
                className="h-2"
                indicatorClassName={
                  step.status === 'error' ? 'bg-red-500' :
                  step.status === 'complete' ? 'bg-green-500' :
                  'bg-blue-500'
                }
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};