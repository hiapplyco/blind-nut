
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Mic, MicOff, Camera, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewPrep() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
      
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone');
      return false;
    }
  };

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    const success = await startMedia();
    if (success) {
      toast.success("Successfully connected to media devices");
    }
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    stopMedia();
    toast.info("Interview session ended");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const userMessage: Message = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('handle-interview', {
        body: {
          message: inputText,
          context: messages
        }
      });

      if (error) throw error;

      if (data?.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to get interview response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interview Preparation</h1>
            <p className="text-muted-foreground mt-2">
              Practice your interview skills with Gemini AI
            </p>
          </div>
          {isConnected && (
            <Button 
              variant="destructive" 
              onClick={handleDisconnect}
            >
              End Session
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {!isConnected ? (
            <div className="space-y-4">              
              <Button 
                onClick={handleConnect} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Start Interview Session"
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleAudio}
                    className={!isAudioEnabled ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleVideo}
                    className={!isVideoEnabled ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.role === 'assistant' 
                          ? 'bg-primary/10 ml-4' 
                          : 'bg-muted mr-4'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your response..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputText.trim()}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
