import { useRef, useState } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { RecordingManager } from "./RecordingManager";
import { MeetingTokenManager } from "./MeetingTokenManager";
import { VideoPreview } from "./VideoPreview";
import { VideoClosingAnimation } from "./VideoClosingAnimation";

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

  const handleCallFrameReady = async (callFrame: DailyCall) => {
    callFrameRef.current = callFrame;
    setIsCallFrameReady(true);

    try {
      const token = await meetingTokenManager.createMeetingToken();
      await callFrame.join({
        url: ROOM_URL,
        token,
      });

      callFrame.on("joined-meeting", () => {
        console.log("Joined meeting");
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
        onParticipantJoined({
          id: event.participant.user_id,
          name: event.participant.user_name,
        });
      });

      callFrame.on("participant-left", (event) => {
        onParticipantLeft({ id: event.participant.user_id });
      });

      // Handle both the leave button click and the browser's back button
      callFrame.on("left-meeting", () => {
        console.log("Left meeting, triggering closing animation");
        setIsClosing(true);
      });

      // Add a handler for the leave button click
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
  };

  const handleClosingAnimationComplete = () => {
    console.log("Animation complete, calling onLeaveMeeting");
    setIsClosing(false);
    onLeaveMeeting();
  };

  return (
    <div className="w-full h-full relative">
      <VideoPreview 
        onCallFrameReady={handleCallFrameReady} 
        roomUrl={ROOM_URL}
      />
      <VideoClosingAnimation 
        isVisible={isClosing}
        onAnimationComplete={handleClosingAnimationComplete}
        mode="turnOff"
      />
    </div>
  );
};