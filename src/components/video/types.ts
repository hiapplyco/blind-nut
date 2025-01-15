import { DailyCall } from "@daily-co/daily-js";

export interface VideoCallFrameProps {
  onJoinMeeting: () => void;
  onParticipantJoined: (participant: { id: string; name?: string }) => void;
  onParticipantLeft: (participant: { id: string }) => void;
  onLeaveMeeting: () => void;
  onRecordingStarted: (recordingId: string) => void;
}

export interface VideoPreviewProps {
  onCallFrameReady: (callFrame: DailyCall) => void;
  roomUrl: string;
}

export interface VideoClosingAnimationProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
  mode?: 'turnOn' | 'turnOff';
}