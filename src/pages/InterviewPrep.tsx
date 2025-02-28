
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewStatus } from "@/components/interview/InterviewStatus";
import { InterviewControls } from "@/components/interview/InterviewControls";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { VideoDisplay } from "@/components/interview/VideoDisplay";
import { useMediaStream } from "@/hooks/useMediaStream";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewPrep() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  
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

  useEffect(() => {
    // Set document title
    document.title = "Interview Preparation | Pipecat";
    
    return () => {
      document.title = "Pipecat"; // Reset title on unmount
    };
  }, []);

  useEffect(() => {
    // Create a session when component mounts
    const createSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('interview_sessions')
            .insert({
              user_id: user.id,
              status: 'created',
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) throw error;
          
          setSessionId(data.id);
        }
      } catch (error) {
        console.error('Error creating interview session:', error);
      }
    };
    
    createSession();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    const success = await startMedia();
    if (success) {
      toast.success("Successfully connected to media devices");
      
      // Update session status
      if (sessionId) {
        await supabase
          .from('interview_sessions')
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    stopMedia();
    toast.info("Interview session ended");
    
    // Update session status
    if (sessionId) {
      await supabase
        .from('interview_sessions')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const userMessage: Message = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Save message to database if sessionId exists
      if (sessionId) {
        await supabase.from('interview_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: inputText
        });
      }

      const { data, error } = await supabase.functions.invoke('handle-interview', {
        body: {
          message: inputText,
          context: messages
        }
      });

      if (error) throw error;

      if (data?.response) {
        const assistantMessage = { 
          role: 'assistant', 
          content: data.response 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to database if sessionId exists
        if (sessionId) {
          await supabase.from('interview_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: data.response
          });
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error("Failed to get interview response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <InterviewHeader />
      
      {isConnected && (
        <InterviewStatus 
          startTime={startTimeRef.current}
          isRecording={false}
        />
      )}
      
      <div className="flex-1 p-6 relative">
        {!isConnected ? (
          <Card className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Interview Preparation</h1>
              <p className="text-muted-foreground mt-2">
                Practice your interview skills with AI assistance
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
          </Card>
        ) : (
          <div className="h-full">
            <VideoDisplay 
              videoRef={videoRef}
              isVideoEnabled={isVideoEnabled}
            />
            
            <InterviewControls 
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleChat={handleToggleChat}
              onEndSession={handleDisconnect}
            />
          </div>
        )}
      </div>
      
      <InterviewChat 
        open={isChatOpen && isConnected} 
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        inputValue={inputText}
        setInputValue={setInputText}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        sessionId={sessionId}
      />
    </div>
  );
}
