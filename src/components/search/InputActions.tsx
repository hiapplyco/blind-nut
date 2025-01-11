import { Button } from "@/components/ui/button";
import { Upload, Video, Mic } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InputActionsProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isProcessing: boolean;
  onShowAccessDialog: () => void;
  onTextUpdate: (text: string) => void;
}

export const InputActions = ({ onFileUpload, isProcessing, onShowAccessDialog, onTextUpdate }: InputActionsProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
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
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative">
        <input
          type="file"
          accept=".pdf"
          onChange={onFileUpload}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center px-4 py-2 bg-white border-2 border-black rounded font-bold 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 
            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Attach PDF'}
        </label>
      </div>
      <Button
        type="button"
        variant="outline"
        className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
          hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
          transition-all opacity-50 cursor-not-allowed"
        onClick={onShowAccessDialog}
      >
        <Video className="h-4 w-4 mr-2" />
        Record Video
      </Button>
      <Button
        type="button"
        variant="outline"
        className={`border-2 border-black ${isRecording ? 'bg-red-500 text-white' : 'bg-white'} 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <Mic className="h-4 w-4 mr-2" />
        {isRecording ? 'Stop Recording' : 'Record Audio'}
      </Button>
    </div>
  );
};