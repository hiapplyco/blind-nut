import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface ProcessAgentProps {
  content: string;
  jobId: number;
  onComplete: () => void;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
}

export const ProcessAgent = ({ content, jobId, onComplete }: ProcessAgentProps) => {
  const { toast } = useToast();
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
      updateStepStatus(index, 'processing', 25);
      
      const response = await supabase.functions.invoke(functionName, { 
        body: { content } 
      });
      
      if (response.error) throw response.error;
      updateStepStatus(index, 'complete', 100);
      
      return response.data[responseKey];
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      updateStepStatus(index, 'error', 0);
      throw error;
    }
  };

  useEffect(() => {
    const processContent = async () => {
      try {
        // Process terms
        const terms = await processStep(0, 'extract-nlp-terms', 'terms');
        
        // Process compensation
        const compensationData = await processStep(1, 'analyze-compensation', 'analysis');
        
        // Process description
        const enhancerData = await processStep(2, 'enhance-job-description', 'enhancedDescription');
        
        // Process summary
        const summaryData = await processStep(3, 'summarize-job', 'summary');

        // Store all results
        const { error: insertError } = await supabase
          .from('agent_outputs')
          .insert({
            job_id: jobId,
            terms,
            compensation_analysis: compensationData,
            enhanced_description: enhancerData,
            job_summary: summaryData
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Verify data is stored before completing
        const { data: verificationData, error: verificationError } = await supabase
          .from('agent_outputs')
          .select('*')
          .eq('job_id', jobId)
          .single();

        if (verificationError) throw verificationError;
        if (!verificationData) throw new Error('Data verification failed');

        toast({
          title: "Analysis Complete",
          description: "Your report is ready to view",
        });

        onComplete();
      } catch (error) {
        console.error('Error in agent processing:', error);
        toast({
          title: "Error",
          description: "Failed to process content. Please try again.",
          variant: "destructive",
        });
      }
    };

    processContent();
  }, [content, jobId, onComplete, toast]);

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