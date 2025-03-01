
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDaily = (
  onJoinMeeting?: () => void,
  onParticipantJoined?: (participant: any) => void,
  onParticipantLeft?: (participant: any) => void,
  onRecordingStarted?: (recordingId: string) => void,
  onLeaveMeeting?: () => void
) => {
  const [ROOM_URL, setRoomUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const createRoom = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('create-daily-room');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.url) {
          console.log("Successfully created Daily room:", data.url);
          setRoomUrl(data.url);
        } else {
          throw new Error('No room URL returned from API');
        }
      } catch (err) {
        console.error('Error creating Daily.co room:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        // Only show toast on first attempt to avoid multiple notifications
        if (retryCount === 0) {
          toast.error('Failed to create video room. Please try again.');
        }
        
        // Retry if we haven't reached max retries
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => createRoom(), 2000); // Retry after 2 seconds
        }
      } finally {
        setIsLoading(false);
      }
    };

    createRoom();
  }, [retryCount]);

  const handleCallFrameReady = useCallback((callFrame: any) => {
    if (!callFrame) return;
    
    // Only attempt to join if we have a valid room URL
    if (ROOM_URL) {
      callFrame.join();

      callFrame.on('joined-meeting', (event: any) => {
        console.log('Successfully joined meeting', event);
        if (onJoinMeeting) onJoinMeeting();
      });

      callFrame.on('participant-joined', (event: any) => {
        console.log('Participant joined:', event.participant);
        if (onParticipantJoined) onParticipantJoined(event.participant);
      });

      callFrame.on('participant-left', (event: any) => {
        console.log('Participant left:', event.participant);
        if (onParticipantLeft) onParticipantLeft(event.participant);
      });

      callFrame.on('recording-started', (event: any) => {
        console.log('Recording started:', event);
        if (onRecordingStarted && event.recordingId) {
          onRecordingStarted(event.recordingId);
        }
      });

      callFrame.on('left-meeting', (event: any) => {
        console.log('Left meeting:', event);
        if (onLeaveMeeting) onLeaveMeeting();
      });
    }
  }, [ROOM_URL, onJoinMeeting, onParticipantJoined, onParticipantLeft, onRecordingStarted, onLeaveMeeting]);

  return {
    ROOM_URL,
    isLoading,
    error,
    handleCallFrameReady,
  };
};
