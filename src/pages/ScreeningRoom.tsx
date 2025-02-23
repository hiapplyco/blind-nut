
import { useState, useRef, useEffect } from "react";
import { VideoCallFrame } from "@/components/video/VideoCallFrame";
import { TranscriptionProcessor } from "@/components/video/TranscriptionProcessor";
import { MeetingDataManager } from "@/components/video/MeetingDataManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScreeningHeader } from "@/components/screening/ScreeningHeader";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useScreeningSession } from "@/hooks/useScreeningSession";

interface Participant {
  id: string;
  name?: string;
}

const ScreeningRoom = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const [whisperTranscript, setWhisperTranscript] = useState<string>("");
  const transcriptionProcessor = TranscriptionProcessor();
  const meetingDataManager = MeetingDataManager();
  
  const { sessionId } = useScreeningSession();
  useWebSocket(sessionId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast.error('Please sign in to access the screening room');
        navigate('/');
        return;
      }
    };
    checkAuth();
  }, [navigate]);

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

      if (sessionId) {
        await supabase
          .from('chat_sessions')
          .update({ status: 'completed' })
          .eq('id', sessionId);
      }

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
      <ScreeningHeader />
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
