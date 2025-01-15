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
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const [whisperTranscript, setWhisperTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  const processRecording = async (recordingId: string) => {
    try {
      // Get recording URL from Daily
      const { data: { secret: dailyApiKey } } = await supabase.functions.invoke('get-daily-key');
      const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
        headers: {
          'Authorization': `Bearer ${dailyApiKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recording details');
      }
      
      const recordingData = await response.json();
      const recordingUrl = recordingData.download_url;

      // Process with Whisper
      const { data: whisperData, error: whisperError } = await supabase.functions.invoke('transcribe-whisper', {
        body: { recordingUrl }
      });

      if (whisperError) throw whisperError;
      if (whisperData?.text) {
        setWhisperTranscript(whisperData.text);
        // Use this transcript for Gemini summary
        generateMeetingSummary(whisperData.text);
      }

      toast.success('Recording processed successfully');
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
    }
  };

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
          timestamp: transcript.timestamp
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  };

  const generateMeetingSummary = async (transcriptText: string) => {
    try {
      const { data: { secret: geminiApiKey } } = await supabase.functions.invoke('get-gemini-key');
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not found');
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
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

      // Use Whisper transcript if available, otherwise use Daily transcripts
      const transcriptText = whisperTranscript || transcripts.map(t => `[${t.timestamp}] ${t.text}`).join('\n');
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

    callFrameRef.current.on('joined-meeting', () => {
      // Start recording automatically when joining
      if (callFrameRef.current && !isRecording) {
        callFrameRef.current.startRecording();
        setIsRecording(true);
        toast.success('Recording started automatically');
      }
    });

    callFrameRef.current.on('recording-started', (event) => {
      console.log('Recording started:', event);
      if (event.recordingId) {
        processRecording(event.recordingId);
      }
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