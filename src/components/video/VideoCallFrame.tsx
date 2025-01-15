import { VideoPreview } from "./VideoPreview";
import { useDaily } from "./hooks/useDaily";
import { VideoCallFrameProps } from "./types";

export const VideoCallFrame = ({
  onJoinMeeting,
  onParticipantJoined,
  onParticipantLeft,
  onLeaveMeeting,
  onRecordingStarted,
}: VideoCallFrameProps) => {
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

  console.log("VideoCallFrame rendering with room URL:", ROOM_URL);

  return (
    <div className="w-full h-full relative">
      <VideoPreview 
        onCallFrameReady={handleCallFrameReady} 
        roomUrl={ROOM_URL}
      />
    </div>
  );
};