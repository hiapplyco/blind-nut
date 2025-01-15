import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VideoControls } from "@/components/video/VideoControls";
import { TranscriptList } from "@/components/video/TranscriptList";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Json } from "@/integrations/supabase/types";

const ROOM_URL = "https://hiapplyco.daily.co/lovable";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface TranscriptionMessage {
  text: string;
  timestamp: string;
  participantId: string;
}

interface Participant {
  id: string;
  name?: string;
  [key: string]: string | undefined;
}

const ScreeningRoom = () => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  const saveTranscription = async (transcript: TranscriptionMessage) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !meetingId) return;

      const { error } = await supabase
        .from('daily_transcriptions')
        .insert({
          user_id: user.id,
          meeting_id: meetingId,
          participant_id: transcript.participantId,
          text: transcript.text,
          timestamp: new Date(transcript.timestamp)
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  };

  const generateMeetingSummary = async (transcriptText: string) => {
    try {
      if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not found');
        return null;
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Please provide a concise summary of this meeting transcript, highlighting:
      - Key discussion points
      - Important decisions made
      - Action items or next steps
      - Overall meeting outcome
      
      Transcript: ${transcriptText}`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      return null;
    }
  };

  const saveMeetingData = async (endTime: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const transcriptText = transcripts.map(t => `[${t.timestamp}] ${t.text}`).join('\n');
      const summary = await generateMeetingSummary(transcriptText);

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          start_time: startTimeRef.current.toISOString(),
          end_time: endTime.toISOString(),
          participants: participants as unknown as Json,
          transcription: transcriptText,
          summary: summary,
          meeting_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setMeetingId(data.id);
      }

      toast.success("Meeting data saved successfully");
    } catch (error) {
      console.error('Error saving meeting data:', error);
      toast.error("Failed to save meeting data");
    }
  };

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        backgroundColor: 'white',
      },
    });

    callFrameRef.current.on('transcription-started', (event) => {
      console.log('Transcription started:', event);
      setIsTranscribing(true);
      toast.success("Transcription started");
    });

    callFrameRef.current.on('transcription-message', (event) => {
      console.log('Transcription message:', event);
      const newTranscript = {
        text: event.text,
        timestamp: new Date(event.timestamp).toISOString(),
        participantId: event.participantId
      };
      
      setTranscripts(prev => [...prev, newTranscript]);
      saveTranscription(newTranscript);
    });

    callFrameRef.current.on('participant-joined', (event) => {
      setParticipants(prev => [...prev, { 
        id: event.participant.user_id,
        name: event.participant.user_name 
      }]);
    });

    callFrameRef.current.on('participant-left', (event) => {
      setParticipants(prev => 
        prev.filter(p => p.id !== event.participant.user_id)
      );
    });

    callFrameRef.current.on('left-meeting', () => {
      const endTime = new Date();
      saveMeetingData(endTime);
    });

    callFrameRef.current.on('transcription-stopped', () => {
      setIsTranscribing(false);
      toast.success("Transcription stopped");
    });

    callFrameRef.current.on('joined-meeting', async () => {
      try {
        if (callFrameRef.current) {
          await callFrameRef.current.startTranscription();
        }
      } catch (error) {
        console.error('Error starting transcription:', error);
        toast.error("Failed to start transcription automatically");
      }
    });

    callFrameRef.current.join({ url: ROOM_URL });

    return () => {
      if (callFrameRef.current) {
        const endTime = new Date();
        saveMeetingData(endTime).finally(() => {
          callFrameRef.current?.destroy();
        });
      }
    };
  }, []);

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText(ROOM_URL);
      toast.success("Meeting link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy meeting link");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFFBF4]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            The Screening Room
          </CardTitle>
          <VideoControls 
            onCopyLink={copyRoomUrl}
          />
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <div ref={callWrapperRef} style={{ width: '100%', height: '100%' }} />
          </div>
          <TranscriptList 
            transcripts={transcripts}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRoom;