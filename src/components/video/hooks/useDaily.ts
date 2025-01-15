import { useRef, useState, useCallback } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTokenManager } from "../MeetingTokenManager";
import { RecordingManager } from "../RecordingManager";

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
  const [currentMeetingId, setCurrentMeetingId] = useState<number | null>(null);

  const ROOM_URL = "https://hiapplyco.daily.co/lovable";
  const meetingTokenManager = MeetingTokenManager();
  
  const recordingManager = RecordingManager({
    callFrame: callFrameRef.current,
    isCallFrameReady,
    isRecording,
    setIsRecording,
  });

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

      // Create a new meeting record when joining
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          start_time: new Date().toISOString(),
          participants: [],
          user_id: user.id,
          meeting_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (meetingError) {
        console.error("Error creating meeting:", meetingError);
        toast.error("Failed to initialize meeting");
        return;
      }

      setCurrentMeetingId(meetingData.id);
      
      await callFrame.join({
        url: ROOM_URL,
        token,
      });

      callFrame.on("joined-meeting", () => {
        console.log("Successfully joined meeting");
        onJoinMeeting();
        setTimeout(async () => {
          if (!isRecording) {
            await recordingManager.startRecording();
          }
          await startTranscription(callFrame);
        }, 1000);
      });

      callFrame.on("recording-started", (event) => {
        console.log("Recording started:", event);
        if (event.recordingId) {
          onRecordingStarted(event.recordingId);
        }
      });

      callFrame.on("transcription-started", (event) => {
        console.log("Transcription started:", event);
      });

      callFrame.on("transcription-message", async (event) => {
        console.log("Transcription message:", event);
        if (currentMeetingId) {
          try {
            await supabase.from('daily_transcriptions').insert({
              participant_id: event.participantId,
              text: event.text,
              timestamp: event.timestamp,
              meeting_id: currentMeetingId,
              user_id: user.id
            });
          } catch (error) {
            console.error("Error saving transcription:", error);
          }
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
        console.log("Left meeting");
        onLeaveMeeting();
      });

      callFrame.on("click", (event: { action: string }) => {
        if (event.action === "leave-meeting") {
          console.log("Leave button clicked");
          onLeaveMeeting();
        }
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
