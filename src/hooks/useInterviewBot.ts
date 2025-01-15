import { useState } from "react";
import { RTVIClient } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useInterviewBot = () => {
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

  return {
    isConnected,
    isMicEnabled,
    isCamEnabled,
    isLoading,
    error,
    initializeClient,
    toggleMic,
    toggleCam,
    disconnect
  };
};