import { useRef, useState, useCallback } from "react";
import { DailyCall, DailyEventObjectRecordingStarted } from "@daily-co/daily-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTokenManager } from "../MeetingTokenManager";
import { RecordingManager } from "../RecordingManager";
import { useTranscriptionHandler } from "./useTranscriptionHandler";
import { useMeetingHandler } from "./useMeetingHandler";
import { useParticipantHandler } from "./useParticipantHandler";

export const useDaily = (
  onJoinMeeting: () => void,
  onParticipantJoined: (participant: { id: string; name?: string }) => void,
  onParticipantLeft: (participant: { id: string }) => void,
  onRecordingStarted: (recordingId: string) => void,
  onLeaveMeeting: () => void,
) => {
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isCallFrameReady, setIsCallFrameReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const ROOM_URL = "https://hiapplyco.daily.co/lovable";
  const meetingTokenManager = MeetingTokenManager();
  
  const { currentMeetingId, createMeeting } = useMeetingHandler();
  const { startTranscription, handleTranscriptionMessage } = useTranscriptionHandler(currentMeetingId);
  const { handleParticipantJoined, handleParticipantLeft } = useParticipantHandler(
    onParticipantJoined,
    onParticipantLeft
  );
  
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        toast.error("Authentication required");
        return;
      }

      await createMeeting(user.id);
      
      await callFrame.join({
        url: ROOM_URL,
        token,
      });

      callFrame.on("joined-meeting", () => {
        console.log("Successfully joined meeting");
        onJoinMeeting();
        setTimeout(async () => {
          console.log("Starting recording after join...");
          if (!isRecording) {
            await recordingManager.startRecording();
          }
          await startTranscription(callFrame);
        }, 2000);
      });

      callFrame.on("recording-started", (event: DailyEventObjectRecordingStarted) => {
        console.log("Recording started event received:", event);
        if (event.recordingId) {
          setIsRecording(true);
          onRecordingStarted(event.recordingId);
        } else {
          console.warn("Recording started but no recordingId received");
          toast.warning("Recording started but ID not received");
        }
      });

      callFrame.on("recording-error", (error: any) => {
        console.error("Recording error:", error);
        toast.error("Recording error occurred");
        setIsRecording(false);
      });

      callFrame.on("recording-stopped", () => {
        console.log("Recording stopped");
        setIsRecording(false);
      });

      callFrame.on("transcription-started", (event) => {
        console.log("Transcription started:", event);
      });

      callFrame.on("transcription-message", async (event) => {
        await handleTranscriptionMessage(event, user.id);
      });

      callFrame.on("participant-joined", handleParticipantJoined);
      callFrame.on("participant-left", handleParticipantLeft);

      callFrame.on("left-meeting", () => {
        console.log("Left meeting");
        if (isRecording) {
          recordingManager.stopRecording();
        }
        onLeaveMeeting();
      });

    } catch (error) {
      console.error("Error initializing call frame:", error);
      toast.error("Failed to initialize video call");
    }
  }, [onJoinMeeting, onParticipantJoined, onParticipantLeft, onRecordingStarted, onLeaveMeeting, isRecording]);

  return {
    callFrameRef,
    isCallFrameReady,
    handleCallFrameReady,
    ROOM_URL,
  };
};