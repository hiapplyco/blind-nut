import { supabase } from "@/integrations/supabase/client";

export const MeetingTokenManager = () => {
  const createMeetingToken = async () => {
    try {
      const { data: { secret: dailyApiKey } } = await supabase.functions.invoke('get-daily-key');
      
      const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dailyApiKey}`
        },
        body: JSON.stringify({
          properties: {
            room_name: 'lovable',
            enable_recording: 'cloud',
            start_cloud_recording: true,
            transcription_bucket: 'recordings'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create meeting token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error creating meeting token:', error);
      throw error;
    }
  };

  return { createMeetingToken };
};