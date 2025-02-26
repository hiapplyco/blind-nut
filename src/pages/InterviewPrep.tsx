
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VideoDisplay } from "@/components/interview/VideoDisplay";
import { MediaControls } from "@/components/interview/MediaControls";
import { ChatSection } from "@/components/interview/ChatSection";
import { useMediaStream } from "@/hooks/useMediaStream";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewPrep() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const {
    videoRef,
    isConnected,
    error,
    isAudioEnabled,
    isVideoEnabled,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
  } = useMediaStream();

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
              <div className="relative">
                <VideoDisplay 
                  videoRef={videoRef}
                  isVideoEnabled={isVideoEnabled}
                />
                <MediaControls
                  isAudioEnabled={isAudioEnabled}
                  isVideoEnabled={isVideoEnabled}
                  onToggleAudio={toggleAudio}
                  onToggleVideo={toggleVideo}
                />
              </div>
              
              <Separator />
              
              <ChatSection
                messages={messages}
                inputText={inputText}
                isLoading={isLoading}
                onInputChange={setInputText}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
