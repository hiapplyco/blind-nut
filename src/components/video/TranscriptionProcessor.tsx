import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranscriptionProcessorProps {
  onTranscriptionComplete: (text: string) => void;
}

export const TranscriptionProcessor = () => {
  const processRecording = async (recordingId: string): Promise<string> => {
    try {
      // Get Daily.co API key from Supabase
      const { data: { secret: dailyApiKey } } = await supabase.functions.invoke('get-daily-key');
      
      // Wait for recording to be available (with retries)
      const maxRetries = 5;
      let retryCount = 0;
      let recordingData;
      
      while (retryCount < maxRetries) {
        const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
          headers: {
            'Authorization': `Bearer ${dailyApiKey}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recording details');
        }
        
        recordingData = await response.json();
        
        // Check if recording is available
        if (recordingData.download_url) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
      
      if (!recordingData?.download_url) {
        throw new Error('Recording URL not available after maximum retries');
      }

      // Process with Whisper
      const { data: whisperData, error: whisperError } = await supabase.functions.invoke('transcribe-whisper', {
        body: { recordingUrl: recordingData.download_url }
      });

      if (whisperError) throw whisperError;
      if (whisperData?.text) {
        return whisperData.text;
      }

      throw new Error('No transcription text received');
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
      throw error;
    }
  };

  return { processRecording };
};