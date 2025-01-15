import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VideoControls } from "@/components/video/VideoControls";
import { TranscriptList } from "@/components/video/TranscriptList";

const ROOM_URL = "https://hiapplyco.daily.co/lovable";

interface TranscriptionMessage {
  text: string;
  timestamp: string;
  participantId: string;
}

const ScreeningRoom = () => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);

  const saveTranscriptsToSupabase = async (newTranscripts: TranscriptionMessage[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase
        .from('parsed_documents')
        .insert({
          user_id: user.id,
          original_filename: `transcript-${new Date().toISOString()}.txt`,
          parsed_text: newTranscripts.map(t => `[${t.timestamp}] ${t.text}`).join('\n'),
          file_path: `transcripts/${user.id}/${new Date().toISOString()}.txt`
        });

      if (error) throw error;
      toast.success("Transcripts saved automatically");
    } catch (error) {
      console.error('Error saving transcripts:', error);
      toast.error("Failed to save transcripts");
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
      
      setTranscripts(prev => {
        const updatedTranscripts = [...prev, newTranscript];
        // Save transcripts automatically whenever we receive a new message
        saveTranscriptsToSupabase(updatedTranscripts);
        return updatedTranscripts;
      });
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
        callFrameRef.current.destroy();
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
