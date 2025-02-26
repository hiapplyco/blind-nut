
import { useRef } from "react";

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
}

export const VideoDisplay = ({ videoRef, isVideoEnabled }: VideoDisplayProps) => {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

