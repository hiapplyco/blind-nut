import { useEffect, useState } from "react";
import { RTVIClient } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const InterviewPrep = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(false);
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Initialize Daily bot through edge function
      const { data: botData, error: botError } = await supabase.functions.invoke('initialize-daily-bot');
      
      if (botError) {
        console.error('Error initializing bot:', botError);
        throw new Error('Failed to initialize interview assistant');
      }

      if (!botData || !botData.room_url) {
        console.error('Invalid bot data received:', botData);
        throw new Error('Invalid response from interview service');
      }

      console.log('Bot initialized:', botData);

      const transport = new DailyTransport();
      const client = new RTVIClient({
        transport,
        enableMic: isMicEnabled,
        enableCam: isCamEnabled,
        params: {
          baseUrl: "https://api.pipecat.ai",
        },
        callbacks: {
          onBotReady: () => {
            console.log("Bot is ready!");
            toast.success("Interview assistant is ready!");
            setIsConnected(true);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Bot error:", error);
            setError("Error connecting to interview assistant");
            setIsConnected(false);
            setIsLoading(false);
          },
          onDisconnected: () => {
            console.log("Bot disconnected");
            toast.info("Interview assistant disconnected");
            setIsConnected(false);
            setIsLoading(false);
          }
        }
      });

      setVoiceClient(client);

      try {
        await client.connect();
      } catch (e) {
        console.error('Connection error:', e);
        throw new Error('Failed to connect to interview service');
      }
    } catch (error) {
      console.error('Error in initializeClient:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize interview assistant');
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (voiceClient) {
      voiceClient.enableMic(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const toggleCam = () => {
    if (voiceClient) {
      voiceClient.enableCam(!isCamEnabled);
      setIsCamEnabled(!isCamEnabled);
    }
  };

  const disconnect = () => {
    if (voiceClient) {
      voiceClient.disconnect();
      setIsConnected(false);
      setError(null);
    }
  };

  useEffect(() => {
    return () => {
      if (voiceClient) {
        voiceClient.disconnect();
      }
    };
  }, [voiceClient]);

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMic}
              className={isMicEnabled ? "bg-primary text-white" : ""}
              disabled={!isConnected}
            >
              {isMicEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCam}
              className={isCamEnabled ? "bg-primary text-white" : ""}
              disabled={!isConnected}
            >
              {isCamEnabled ? <Video /> : <VideoOff />}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {!isConnected ? (
            <Button 
              onClick={initializeClient} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Start Interview Prep"}
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive" className="w-full">
              End Session
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Speaking with: The Old Grasshopper
              <br />
              Start by telling me what kind of interview you're preparing for!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InterviewPrep;