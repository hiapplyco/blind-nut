
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Camera, Settings } from "lucide-react";

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export const MediaControls = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo
}: MediaControlsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggleAudio}
        className={!isAudioEnabled ? "bg-red-500 hover:bg-red-600" : ""}
      >
        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggleVideo}
        className={!isVideoEnabled ? "bg-red-500 hover:bg-red-600" : ""}
      >
        <Camera className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

