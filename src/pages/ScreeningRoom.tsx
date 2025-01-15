import { useState, useRef, useEffect } from "react";
import { VideoCallFrame } from "@/components/video/VideoCallFrame";
import { TranscriptionProcessor } from "@/components/video/TranscriptionProcessor";
import { MeetingDataManager } from "@/components/video/MeetingDataManager";
import { supabase } from "@/integrations/supabase/client";
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
  const [sessionId, setSessionId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const [whisperTranscript, setWhisperTranscript] = useState<string>("");
  const transcriptionProcessor = TranscriptionProcessor();
  const meetingDataManager = MeetingDataManager();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Create a new chat session
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            title: `Interview Session ${new Date().toLocaleString()}`,
            status: 'active'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setSessionId(session.id);

        // Initialize WebSocket connection
        const { data: wsData, error: wsError } = await supabase.functions.invoke('initialize-daily-bot');
        if (wsError) throw wsError;

        const ws = new WebSocket(wsData.websocket_url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket Connected');
          ws.send(JSON.stringify({
            setup: {
              generation_config: { response_modalities: ["TEXT"] }
            }
          }));
        };

        ws.onmessage = async (event) => {
          const response = JSON.parse(event.data);
          
          if (response.text) {
            // Store message in Supabase
            await supabase.from('chat_messages').insert({
              session_id: session.id,
              role: 'assistant',
              content: response.text
            });

            toast.success('Received response from assistant');
          }

          if (response.error) {
            toast.error(response.error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('Connection error occurred');
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat session');
      }
    };

    initializeChat();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

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

      // Update chat session status
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