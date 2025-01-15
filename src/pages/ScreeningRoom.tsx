import { useState, useRef } from "react";
import { VideoControls } from "@/components/video/VideoControls";
import { VideoCallFrame } from "@/components/video/VideoCallFrame";
import { TranscriptionProcessor } from "@/components/video/TranscriptionProcessor";
import { MeetingDataManager } from "@/components/video/MeetingDataManager";
import { toast } from "sonner";

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

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText("https://hiapplyco.daily.co/lovable");
      toast.success("Meeting link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy meeting link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center bg-background">
        <h1 className="text-2xl font-bold">The Screening Room</h1>
        <VideoControls onCopyLink={copyRoomUrl} />
      </div>
      <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 80px)' }}>
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