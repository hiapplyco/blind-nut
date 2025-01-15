import { useRef, useState } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { RecordingManager } from "./RecordingManager";
import { MeetingTokenManager } from "./MeetingTokenManager";
import { VideoPreview } from "./VideoPreview";
import { RoomSettings } from "./RoomSettings";

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
  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState({
    allowParticipantControls: true,
    showFullscreenButton: true,
    showLeaveButton: true,
  });

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

    try {
      await callFrame.load({
        url: ROOM_URL,
      });

      callFrame.on("joined-meeting", () => {
        console.log("Joined meeting, call frame ready");
        setIsCallFrameReady(true);
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

      callFrame.on("left-meeting", onLeaveMeeting);
    } catch (error) {
      console.error("Error initializing call frame:", error);
      toast.error("Failed to initialize video call");
    }
  };

  const joinMeeting = async () => {
    try {
      if (!callFrameRef.current) return;

      const token = await meetingTokenManager.createMeetingToken();
      await callFrameRef.current.join({
        url: ROOM_URL,
        token,
      });
      setShowSettings(false);
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting");
    }
  };

  if (showSettings) {
    return (
      <div className="flex gap-6 w-full h-full">
        <VideoPreview
          onCallFrameReady={handleCallFrameReady}
          settings={settings}
        />
        <RoomSettings
          settings={settings}
          onSettingsChange={setSettings}
          onJoinMeeting={joinMeeting}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: "400px" }}>
      <VideoPreview onCallFrameReady={handleCallFrameReady} settings={settings} />
    </div>
  );
};