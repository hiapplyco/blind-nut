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
  message: string;
  progress: number;
}

export const AgentProcessor = ({ content, jobId, onComplete }: AgentProcessorProps) => {
  const { toast } = useToast();
  const { setOutput } = useClientAgentOutputs();
  const [currentStep, setCurrentStep] = useState<ProcessingStep>({
    message: "Initializing analysis...",
    progress: 0
  });

  const updateProgress = (message: string, progress: number) => {
    setCurrentStep({ message, progress });
  };

  const processStep = async (
    stepMessage: string, 
    functionName: string, 
    responseKey: string,
    progressStart: number,
    progressEnd: number
  ): Promise<any> => {
    try {
      console.log(`Starting ${functionName} processing...`);
      updateProgress(stepMessage, progressStart);
      
      const response = await supabase.functions.invoke(functionName, { 
        body: { content } 
      });
      
      if (response.error) {
        console.error(`Error in ${functionName}:`, response.error);
        throw response.error;
      }

      console.log(`${functionName} response:`, response.data);
      updateProgress(stepMessage, progressEnd);
      
      return response.data[responseKey];
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      throw error;
    }
  };

  const persistToDatabase = useMutation({
    mutationFn: async (agentOutput: any) => {
      console.log('Persisting agent output to database:', agentOutput);
      updateProgress("Saving analysis results...", 95);
      
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
      updateProgress("Analysis complete!", 100);
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
        
        // Extract terms
        const terms = await processStep(
          "Analyzing requirements and extracting key terms...",
          'extract-nlp-terms',
          'terms',
          10,
          25
        );
        if (!isMounted) return;
        
        // Analyze compensation
        const compensationData = await processStep(
          "Evaluating compensation details...",
          'analyze-compensation',
          'analysis',
          30,
          50
        );
        if (!isMounted) return;
        
        // Enhance description
        const enhancerData = await processStep(
          "Enhancing job description...",
          'enhance-job-description',
          'enhancedDescription',
          55,
          75
        );
        if (!isMounted) return;
        
        // Generate summary
        const summaryData = await processStep(
          "Generating comprehensive report...",
          'summarize-job',
          'summary',
          80,
          90
        );
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {currentStep.message}
              </span>
              <span className="text-sm text-gray-500">
                {currentStep.progress}%
              </span>
            </div>
            <Progress 
              value={currentStep.progress} 
              className="h-2"
              indicatorClassName={
                currentStep.progress === 100 ? 'bg-green-500' :
                'bg-blue-500 transition-all duration-500'
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
};