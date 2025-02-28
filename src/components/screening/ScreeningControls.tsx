
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  MessageSquare,
  Circle,
  StopCircle
} from "lucide-react";
import { toast } from "sonner";

interface ScreeningControlsProps {
  onToggleChat: () => void;
  onScreenShare: () => void;
  callFrame: any;
}

export const ScreeningControls = ({ 
  onToggleChat, 
  onScreenShare,
  callFrame
}: ScreeningControlsProps) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const toggleVideo = () => {
    if (callFrame) {
      if (isVideoEnabled) {
        callFrame.setLocalVideo(false);
      } else {
        callFrame.setLocalVideo(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
      toast.success(`Camera ${!isVideoEnabled ? 'enabled' : 'disabled'}`);
    }
  };

  const toggleAudio = () => {
    if (callFrame) {
      if (isAudioEnabled) {
        callFrame.setLocalAudio(false);
      } else {
        callFrame.setLocalAudio(true);
      }
      setIsAudioEnabled(!isAudioEnabled);
      toast.success(`Microphone ${!isAudioEnabled ? 'enabled' : 'disabled'}`);
    }
  };

  const toggleRecording = async () => {
    if (!callFrame) return;

    try {
      if (!isRecording) {
        await callFrame.startRecording();
        setIsRecording(true);
        toast.success('Recording started');
      } else {
        await callFrame.stopRecording();
        setIsRecording(false);
        toast.success('Recording stopped');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Recording failed');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-[#F8F5FF] p-3 rounded-full shadow-lg z-30 border border-[#7E69AB]">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleVideo}
        className={`rounded-full ${!isVideoEnabled ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleAudio}
        className={`rounded-full ${!isAudioEnabled ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onScreenShare}
        className="rounded-full"
      >
        <Share2 className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleRecording}
        className={`rounded-full ${isRecording ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isRecording ? <StopCircle className="h-5 w-5" /> : <Circle className="h-5 w-5 fill-red-500" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleChat}
        className="rounded-full"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
};
