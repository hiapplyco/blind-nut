import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface VideoControlsProps {
  onCopyLink: () => void;
}

export const VideoControls = ({
  onCopyLink,
}: VideoControlsProps) => {
  return (
    <div className="flex gap-2">
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