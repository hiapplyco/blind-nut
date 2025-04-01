
import { useRef } from "react";
import { VideoPreview } from "./VideoPreview";
import { useDaily } from "./hooks/useDaily";
import { VideoCallFrameProps } from "./types";

export const VideoCallFrame = ({
  onJoinMeeting,
  onParticipantJoined,
  onParticipantLeft,
  onLeaveMeeting,
  onRecordingStarted,
  onCallFrameReady,
}: VideoCallFrameProps) => {
  const callFrameRef = useRef<any>(null);
  
  const {
    handleCallFrameReady,
    ROOM_URL,
  } = useDaily(
    onJoinMeeting,
    onParticipantJoined,
    onParticipantLeft,
    onRecordingStarted,
    onLeaveMeeting
  );

  const handleFrameReady = (frame: any) => {
    callFrameRef.current = frame;
    handleCallFrameReady(frame);
    if (onCallFrameReady) {
      onCallFrameReady(frame);
    }
  };

  console.log("VideoCallFrame rendering with room URL:", ROOM_URL);

  return (
    <div className="w-full h-full relative">
      <VideoPreview 
        onCallFrameReady={handleFrameReady} 
        roomUrl={ROOM_URL}
      />
    </div>
  );
};
