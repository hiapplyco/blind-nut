import { Button } from "@/components/ui/button";
import { Video, VideoOff } from "lucide-react";

interface MediaControlsProps {
  isConnected: boolean;
  onEndCall: () => void;
}

export const MediaControls = ({
  isConnected,
  onEndCall
}: MediaControlsProps) => {
  return (
    <div className="flex gap-2">
      {isConnected && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onEndCall}
          className="bg-red-500 hover:bg-red-600"
        >
          <VideoOff />
        </Button>
      )}
    </div>
  );
};