import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CaptureWindowProps {
  onTextUpdate: (text: string) => void;
}

export const CaptureWindow = ({ onTextUpdate }: CaptureWindowProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorderRef, setMediaRecorderRef] = useState<MediaRecorder | null>(null);
  const chunksRef = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorderRef(mediaRecorder);
      chunksRef[1]([]);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef[0].push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef[0], { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            if (data?.text) {
              onTextUpdate(data.text);
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast.error('Failed to transcribe audio');
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef && isRecording) {
      mediaRecorderRef.stop();
      mediaRecorderRef.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Card className="p-6 mt-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Capture Content</h2>
        <p className="text-gray-600">
          Record meetings, intake calls, or onboarding sessions to generate search queries
        </p>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
              hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
              transition-all opacity-50 cursor-not-allowed"
            disabled
          >
            <Video className="h-4 w-4 mr-2" />
            Record Video
          </Button>
          <Button
            type="button"
            variant="outline"
            className={`flex-1 border-2 border-black ${isRecording ? 'bg-red-500 text-white' : 'bg-white'} 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Record Audio'}
          </Button>
        </div>
      </div>
    </Card>
  );
};