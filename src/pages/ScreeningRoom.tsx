import { useState, useRef } from "react";
import { VideoControls } from "@/components/video/VideoControls";
import { TranscriptList } from "@/components/video/TranscriptList";
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
  };

  const handleParticipantJoined = (participant: Participant) => {
    setParticipants(prev => [...prev, participant]);
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
    } catch (error) {
      console.error('Error saving meeting data:', error);
    }
  };

  const handleRecordingStarted = async (recordingId: string) => {
    try {
      const transcript = await transcriptionProcessor.processRecording(recordingId);
      setWhisperTranscript(transcript);
    } catch (error) {
      console.error('Error processing recording:', error);
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
    <div className="h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">The Screening Room</h1>
        <VideoControls onCopyLink={copyRoomUrl} />
      </div>
      <div className="flex-1 relative">
        <VideoCallFrame
          onJoinMeeting={handleJoinMeeting}
          onParticipantJoined={handleParticipantJoined}
          onParticipantLeft={handleParticipantLeft}
          onLeaveMeeting={handleLeaveMeeting}
          onRecordingStarted={handleRecordingStarted}
        />
      </div>
      <div className="h-[200px] p-4">
        <TranscriptList transcripts={transcripts} />
      </div>
    </div>
  );
};

export default ScreeningRoom;