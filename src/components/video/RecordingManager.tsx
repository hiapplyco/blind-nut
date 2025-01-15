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
          preset: "active-participant"
        },
        width: 1920,
        height: 1080,
        backgroundColor: "#000000"
      });
      
      setIsRecording(true);
      toast.success('Recording started automatically');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  return { startRecording };
};