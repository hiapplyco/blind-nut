import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const useMeetingHandler = () => {
  const [currentMeetingId, setCurrentMeetingId] = useState<number | null>(null);

  const createMeeting = async (userId: string) => {
    try {
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          start_time: new Date().toISOString(),
          participants: [],
          user_id: userId,
          meeting_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (meetingError) {
        console.error("Error creating meeting:", meetingError);
        throw meetingError;
      }

      setCurrentMeetingId(meetingData.id);
      return meetingData.id;
    } catch (error) {
      console.error("Error in createMeeting:", error);
      throw error;
    }
  };

  return {
    currentMeetingId,
    createMeeting
  };
};