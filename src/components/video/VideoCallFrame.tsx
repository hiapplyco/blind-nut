import { VideoPreview } from "./VideoPreview";
import { VideoClosingAnimation } from "./VideoClosingAnimation";
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
    isClosing,
    setIsClosing,
    ROOM_URL,
  } = useDaily(
    onJoinMeeting,
    onParticipantJoined,
    onParticipantLeft,
    onRecordingStarted
  );

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