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
          console.log('Recording not ready yet, retrying...');
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
          continue;
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
      
      // If we couldn't get the recording after all retries, return empty string
      // This allows the app to continue working without blocking on transcription
      if (!recordingData?.download_url) {
        console.log('Recording not available yet, will be processed later');
        toast.info('Recording will be processed once ready');
        return '';
      }

      // Process with Whisper
      const { data: whisperData, error: whisperError } = await supabase.functions.invoke('transcribe-whisper', {
        body: { recordingUrl: recordingData.download_url }
      });

      if (whisperError) {
        console.error('Whisper processing error:', whisperError);
        toast.info('Transcription will be available later');
        return '';
      }

      if (whisperData?.text) {
        return whisperData.text;
      }

      return '';
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.info('Recording will be processed later');
      return '';
    }
  };

  return { processRecording };
};