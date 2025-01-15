import { useState, useRef } from "react";
import { VideoCallFrame } from "@/components/video/VideoCallFrame";
import { TranscriptionProcessor } from "@/components/video/TranscriptionProcessor";
import { MeetingDataManager } from "@/components/video/MeetingDataManager";
import { toast } from "sonner";
import { ArrowLeft, History } from "lucide-react";
import { Link } from "react-router-dom";

interface TranscriptionMessage {
  text: string;
  timestamp: string;
  participantId: string;
}

interface Participant {
  id: string;
  name?: string;
}

const ScreeningRoom = () => {
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const [whisperTranscript, setWhisperTranscript] = useState<string>("");
  const transcriptionProcessor = TranscriptionProcessor();
  const meetingDataManager = MeetingDataManager();

  const handleJoinMeeting = () => {
    console.log('Joined meeting');
    toast.success('Welcome to the screening room! Your camera and microphone should start automatically.');
  };

  const handleParticipantJoined = (participant: Participant) => {
    setParticipants(prev => [...prev, participant]);
    toast.info(`${participant.name || 'A new participant'} joined the meeting`);
  };

  const handleParticipantLeft = (participant: { id: string }) => {
    setParticipants(prev => prev.filter(p => p.id !== participant.id));
  };

  const handleLeaveMeeting = async () => {
    const endTime = new Date();
    try {
      await meetingDataManager.saveMeetingData({
        startTime: startTimeRef.current,
        endTime,
        participants,
        transcription: whisperTranscript
      });
      toast.success('Meeting data saved successfully');
    } catch (error) {
      console.error('Error saving meeting data:', error);
      toast.error('Failed to save meeting data');
    }
  };

  const handleRecordingStarted = async (recordingId: string) => {
    try {
      const transcript = await transcriptionProcessor.processRecording(recordingId);
      setWhisperTranscript(transcript);
      toast.success('Recording started successfully');
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Header */}
      <header className="bg-[#F8F5FF] border-b border-[#7E69AB] p-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center text-[#4A2B1C] hover:text-[#9b87f5] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Search</span>
        </Link>
        <Link 
          to="/dashboard" 
          className="flex items-center text-[#4A2B1C] hover:text-[#9b87f5] transition-colors"
        >
          <History className="w-5 h-5 mr-2" />
          <span>View History</span>
        </Link>
      </header>

      {/* Video Call Container */}
      <div className="flex-1 relative">
        <VideoCallFrame
          onJoinMeeting={handleJoinMeeting}
          onParticipantJoined={handleParticipantJoined}
          onParticipantLeft={handleParticipantLeft}
          onLeaveMeeting={handleLeaveMeeting}
          onRecordingStarted={handleRecordingStarted}
        />
      </div>
    </div>
  );
};

export default ScreeningRoom;