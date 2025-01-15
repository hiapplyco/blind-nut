import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranscriptionProcessorProps {
  onTranscriptionComplete: (text: string) => void;
}

export const TranscriptionProcessor = () => {
  const processRecording = async (recordingId: string): Promise<string> => {
    try {
      console.log('Starting video processing for recording:', recordingId);
      
      // Start the video processing pipeline
      const { data: processingData, error: processingError } = await supabase.functions.invoke(
        'process-video-recording',
        {
          body: { recordingId }
        }
      );

      if (processingError) {
        console.error('Processing error:', processingError);
        toast.error('Error processing recording');
        return '';
      }

      if (processingData?.analysis) {
        toast.success('Recording processed successfully');
        return processingData.analysis;
      }

      return '';
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Error processing recording');
      return '';
    }
  };

  return { processRecording };
};