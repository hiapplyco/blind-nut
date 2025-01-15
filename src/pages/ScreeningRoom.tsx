import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
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
    <div className="container max-w-7xl mx-auto py-8 min-h-screen">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFFBF4] h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            The Screening Room
          </CardTitle>
          <VideoControls onCopyLink={copyRoomUrl} />
        </CardHeader>
        <CardContent className="h-[calc(100vh-16rem)] flex flex-col">
          <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative mb-4">
            <VideoCallFrame
              onJoinMeeting={handleJoinMeeting}
              onParticipantJoined={handleParticipantJoined}
              onParticipantLeft={handleParticipantLeft}
              onLeaveMeeting={handleLeaveMeeting}
              onRecordingStarted={handleRecordingStarted}
            />
          </div>
          <TranscriptList transcripts={transcripts} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRoom;