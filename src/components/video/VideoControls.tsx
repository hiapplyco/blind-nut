import { Button } from "@/components/ui/button";
import { Copy, Mic, MicOff } from "lucide-react";

interface VideoControlsProps {
  isTranscribing: boolean;
  onToggleTranscription: () => void;
  onCopyLink: () => void;
}

export const VideoControls = ({
  isTranscribing,
  onToggleTranscription,
  onCopyLink,
}: VideoControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onToggleTranscription}
      >
        {isTranscribing ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {isTranscribing ? 'Stop Transcription' : 'Start Transcription'}
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onCopyLink}
      >
        <Copy className="h-4 w-4" />
        Copy Meeting Link
      </Button>
    </div>
  );
};