import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, StopCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CaptureWindowProps {
  onTextUpdate: (text: string) => void;
}

type RecordingType = 'audio' | 'video' | 'both' | null;

export const CaptureWindow = ({ onTextUpdate }: CaptureWindowProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<RecordingType>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup function to stop all tracks when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async (type: RecordingType) => {
    try {
      const constraints = {
        audio: type === 'audio' || type === 'both',
        video: type === 'video' || type === 'both' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (type === 'video' || type === 'both') {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (error) {
            console.error('Error playing video:', error);
            toast.error('Failed to start video preview');
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const recordingBlob = new Blob(chunksRef.current, { type: mimeType });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('User not authenticated');
            return;
          }

          // Upload to Supabase Storage
          const fileName = `${user.id}/${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(fileName, recordingBlob);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('recordings')
            .getPublicUrl(fileName);

          // Process with Gemini
          const { data, error } = await supabase.functions.invoke('process-recording', {
            body: { url: publicUrl, type }
          });

          if (error) throw error;

          if (data?.text) {
            onTextUpdate(data.text);
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          toast.error('Failed to process recording');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType(type);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access media devices');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  return (
    <Card className="p-6 mt-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Capture Content</h2>
        <p className="text-gray-600">
          Record meetings, intake calls, or onboarding sessions to generate search queries
        </p>
        
        {(recordingType === 'video' || recordingType === 'both') && (
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
        )}

        <div className="flex justify-center">
          {!isRecording ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-[#8B5CF6] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                    hover:bg-[#7C3AED] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                    transition-all"
                >
                  Start Recording
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-2 border-black shadow-lg">
                <DropdownMenuItem 
                  onClick={() => startRecording('audio')}
                  className="hover:bg-[#8B5CF6]/10 cursor-pointer"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Record Audio
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => startRecording('video')}
                  className="hover:bg-[#8B5CF6]/10 cursor-pointer"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Record Video
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => startRecording('both')}
                  className="hover:bg-[#8B5CF6]/10 cursor-pointer"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Record Both
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:bg-red-600 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                transition-all"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};