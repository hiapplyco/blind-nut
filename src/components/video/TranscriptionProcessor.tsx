import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranscriptionProcessorProps {
  onTranscriptionComplete: (text: string) => void;
}

export const TranscriptionProcessor = () => {
  const processRecording = async (recordingId: string): Promise<string> => {
    try {
      const { data: { secret: dailyApiKey } } = await supabase.functions.invoke('get-daily-key');
      const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
        headers: {
          'Authorization': `Bearer ${dailyApiKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recording details');
      }
      
      const recordingData = await response.json();
      const recordingUrl = recordingData.download_url;

      const { data: whisperData, error: whisperError } = await supabase.functions.invoke('transcribe-whisper', {
        body: { recordingUrl }
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