
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare,
  PhoneOff,
  CircleDot,
  Square
} from "lucide-react";

interface InterviewControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isRecording: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onToggleRecording: () => void;
  onEndSession: () => void;
}

export const InterviewControls = ({ 
  isAudioEnabled, 
  isVideoEnabled,
  isRecording,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleRecording,
  onEndSession
}: InterviewControlsProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-[#F8F5FF] p-3 rounded-full shadow-lg z-30 border border-[#7E69AB]">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleVideo}
        className={`rounded-full ${!isVideoEnabled ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleAudio}
        className={`rounded-full ${!isAudioEnabled ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleRecording}
        className={`rounded-full ${isRecording ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <CircleDot className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleChat}
        className="rounded-full"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="destructive" 
        size="icon" 
        onClick={onEndSession}
        className="rounded-full"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
};
