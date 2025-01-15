import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface MediaControlsProps {
  isMicEnabled: boolean;
  isCamEnabled: boolean;
  isConnected: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

export const MediaControls = ({
  isMicEnabled,
  isCamEnabled,
  isConnected,
  onToggleMic,
  onToggleCam
}: MediaControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleMic}
        className={isMicEnabled ? "bg-primary text-white" : ""}
        disabled={!isConnected}
      >
        {isMicEnabled ? <Mic /> : <MicOff />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleCam}
        className={isCamEnabled ? "bg-primary text-white" : ""}
        disabled={!isConnected}
      >
        {isCamEnabled ? <Video /> : <VideoOff />}
      </Button>
    </div>
  );
};