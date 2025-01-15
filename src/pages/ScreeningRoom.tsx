import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Video, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ROOM_URL = "https://hiapplyco.daily.co/lovable";

interface TranscriptionMessage {
  text: string;
  timestamp: string;  // Explicitly define as string since Daily.co provides ISO string
  participantId: string;
}

const ScreeningRoom = () => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    // Create the callframe
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

    // Set up event listeners
    callFrameRef.current.on('transcription-started', (event) => {
      console.log('Transcription started:', event);
      setIsTranscribing(true);
      toast.success("Transcription started");
    });

    callFrameRef.current.on('transcription-message', (event) => {
      console.log('Transcription message:', event);
      setTranscripts(prev => [...prev, {
        text: event.text,
        timestamp: event.timestamp,  // Daily.co provides this as an ISO string
        participantId: event.participantId
      }]);
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

    // Join the call
    callFrameRef.current.join({ url: ROOM_URL });

    // Cleanup
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

  const toggleTranscription = async () => {
    if (!callFrameRef.current) return;

    try {
      if (!isTranscribing) {
        await callFrameRef.current.startTranscription();
      } else {
        await callFrameRef.current.stopTranscription();
      }
    } catch (error) {
      console.error('Error toggling transcription:', error);
      toast.error("Failed to toggle transcription");
    }
  };

  const saveTranscriptsToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save transcripts");
        return;
      }

      const { error } = await supabase
        .from('parsed_documents')
        .insert({
          user_id: user.id,
          original_filename: `transcript-${new Date().toISOString()}.txt`,
          parsed_text: transcripts.map(t => `[${t.timestamp}] ${t.text}`).join('\n'),
          file_path: `transcripts/${user.id}/${new Date().toISOString()}.txt`
        });

      if (error) throw error;
      toast.success("Transcripts saved successfully!");
    } catch (error) {
      console.error('Error saving transcripts:', error);
      toast.error("Failed to save transcripts");
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={toggleTranscription}
            >
              {isTranscribing ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isTranscribing ? 'Stop Transcription' : 'Start Transcription'}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={copyRoomUrl}
            >
              <Copy className="h-4 w-4" />
              Copy Meeting Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <div ref={callWrapperRef} style={{ width: '100%', height: '100%' }} />
          </div>
          {transcripts.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Live Transcript</h3>
                <Button onClick={saveTranscriptsToSupabase}>Save Transcript</Button>
              </div>
              <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-4 border">
                {transcripts.map((t, i) => (
                  <div key={i} className="mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </span>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRoom;