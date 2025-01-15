import { supabase } from "@/integrations/supabase/client";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";

export const useTranscriptionHandler = (currentMeetingId: number | null) => {
  const startTranscription = async (callFrame: DailyCall) => {
    try {
      await callFrame.startTranscription();
      console.log("Transcription started");
      toast.success("Live transcription enabled");
    } catch (error) {
      console.error("Error starting transcription:", error);
      toast.error("Failed to start transcription");
    }
  };

  const handleTranscriptionMessage = async (event: any, userId: string) => {
    console.log("Transcription message:", event);
    if (currentMeetingId) {
      try {
        await supabase.from('daily_transcriptions').insert({
          participant_id: event.participantId,
          text: event.text,
          timestamp: event.timestamp,
          meeting_id: currentMeetingId,
          user_id: userId
        });
      } catch (error) {
        console.error("Error saving transcription:", error);
      }
    }
  };

  return {
    startTranscription,
    handleTranscriptionMessage
  };
};