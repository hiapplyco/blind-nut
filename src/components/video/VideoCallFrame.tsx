import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";

interface VideoCallFrameProps {
  onJoinMeeting: () => void;
  onParticipantJoined: (participant: { id: string; name?: string }) => void;
  onParticipantLeft: (participant: { id: string }) => void;
  onLeaveMeeting: () => void;
  onRecordingStarted: (recordingId: string) => void;
}

export const VideoCallFrame = ({
  onJoinMeeting,
  onParticipantJoined,
  onParticipantLeft,
  onLeaveMeeting,
  onRecordingStarted,
}: VideoCallFrameProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isCallFrameReady, setIsCallFrameReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const ROOM_URL = "https://hiapplyco.daily.co/lovable";

  const startRecording = async () => {
    try {
      if (!callFrameRef.current || !isCallFrameReady) {
        console.error('Call frame not ready');
        return;
      }

      await callFrameRef.current.startRecording();
      setIsRecording(true);
      toast.success('Recording started automatically');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    const initializeCallFrame = async () => {
      try {
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            backgroundColor: 'white',
          },
        });

        callFrameRef.current.on('joined-meeting', () => {
          console.log('Joined meeting, call frame ready');
          setIsCallFrameReady(true);
          onJoinMeeting();
          setTimeout(() => {
            if (!isRecording) {
              startRecording();
            }
          }, 1000);
        });

        callFrameRef.current.on('recording-started', (event) => {
          console.log('Recording started:', event);
          if (event.recordingId) {
            onRecordingStarted(event.recordingId);
          }
        });

        callFrameRef.current.on('participant-joined', (event) => {
          onParticipantJoined({
            id: event.participant.user_id,
            name: event.participant.user_name
          });
        });

        callFrameRef.current.on('participant-left', (event) => {
          onParticipantLeft({ id: event.participant.user_id });
        });

        callFrameRef.current.on('left-meeting', onLeaveMeeting);

        await callFrameRef.current.join({ url: ROOM_URL });

      } catch (error) {
        console.error('Error initializing call frame:', error);
        toast.error('Failed to initialize video call');
      }
    };

    initializeCallFrame();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [onJoinMeeting, onParticipantJoined, onParticipantLeft, onLeaveMeeting, onRecordingStarted]);

  return (
    <div ref={callWrapperRef} className="w-full h-full" />
  );
};