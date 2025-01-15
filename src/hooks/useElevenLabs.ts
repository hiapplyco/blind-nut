import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useElevenLabs = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = async (text: string, voiceId: string = "pFZP5JQG7iQjIQuC4Bku") => {
    try {
      setIsSpeaking(true);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      toast.error('Failed to generate speech');
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speakText
  };
};