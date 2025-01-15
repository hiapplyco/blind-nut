import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecordingManagerProps {
  callFrame: any;
  isCallFrameReady: boolean;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

export const RecordingManager = ({
  callFrame,
  isCallFrameReady,
  isRecording,
  setIsRecording
}: RecordingManagerProps) => {
  const startRecording = async () => {
    try {
      if (!callFrame || !isCallFrameReady) {
        console.error('Call frame not ready');
        return;
      }

      await callFrame.startRecording({
        layout: {
          preset: "active-participant",
          max_cam_streams: 25,
          screen_share_mode: "crop"
        },
        width: 1920,
        height: 1080,
        backgroundColor: "#2C1810", // Match our dark brown theme
        cloudMode: "cloud", // Enable cloud recording
        streamMode: "automatic",
        recordOnStart: true,
        startAudioOnly: false,
        maxRecordingDuration: 14400, // 4 hours max
      });
      
      setIsRecording(true);
      toast.success('Recording started automatically');
      console.log('Recording started with cloud storage enabled');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  return { startRecording };
};