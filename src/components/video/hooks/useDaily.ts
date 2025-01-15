import { useRef, useState, useCallback } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { MeetingTokenManager } from "../MeetingTokenManager";
import { RecordingManager } from "../RecordingManager";

export const useDaily = (
  onJoinMeeting: () => void,
  onParticipantJoined: (participant: { id: string; name?: string }) => void,
  onParticipantLeft: (participant: { id: string }) => void,
  onRecordingStarted: (recordingId: string) => void,
) => {
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isCallFrameReady, setIsCallFrameReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const ROOM_URL = "https://hiapplyco.daily.co/lovable";
  const meetingTokenManager = MeetingTokenManager();
  
  const recordingManager = RecordingManager({
    callFrame: callFrameRef.current,
    isCallFrameReady,
    isRecording,
    setIsRecording,
  });

  const handleCallFrameReady = useCallback(async (callFrame: DailyCall) => {
    console.log("Call frame ready, preparing to join meeting");
    callFrameRef.current = callFrame;
    setIsCallFrameReady(true);

    try {
      const token = await meetingTokenManager.createMeetingToken();
      console.log("Meeting token created, joining room");
      
      await callFrame.join({
        url: ROOM_URL,
        token,
      });

      callFrame.on("joined-meeting", () => {
        console.log("Successfully joined meeting");
        onJoinMeeting();
        setTimeout(() => {
          if (!isRecording) {
            recordingManager.startRecording();
          }
        }, 1000);
      });

      callFrame.on("recording-started", (event) => {
        console.log("Recording started:", event);
        if (event.recordingId) {
          onRecordingStarted(event.recordingId);
        }
      });

      callFrame.on("participant-joined", (event) => {
        console.log("Participant joined:", event);
        onParticipantJoined({
          id: event.participant.user_id,
          name: event.participant.user_name,
        });
      });

      callFrame.on("participant-left", (event) => {
        console.log("Participant left:", event);
        onParticipantLeft({ id: event.participant.user_id });
      });

      callFrame.on("left-meeting", () => {
        console.log("Left meeting, triggering closing animation");
        setIsClosing(true);
      });

      callFrame.on("click", (event: { action: string }) => {
        if (event.action === "leave-meeting") {
          console.log("Leave button clicked");
          setIsClosing(true);
        }
      });
    } catch (error) {
      console.error("Error initializing call frame:", error);
      toast.error("Failed to initialize video call");
    }
  }, [onJoinMeeting, onParticipantJoined, onParticipantLeft, onRecordingStarted, isRecording]);

  return {
    callFrameRef,
    isCallFrameReady,
    isClosing,
    setIsClosing,
    handleCallFrameReady,
    ROOM_URL,
  };
};