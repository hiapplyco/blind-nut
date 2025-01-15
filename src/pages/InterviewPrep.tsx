import { useEffect, useState } from "react";
import { RTVIClient } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const InterviewPrep = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(false);
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);

  const initializeClient = async () => {
    const client = new RTVIClient({
      transport: new DailyTransport({
        dailyFactoryOptions: {
          // Daily transport specific configuration
        }
      }),
      enableMic: isMicEnabled,
      enableCam: isCamEnabled,
      llm: {
        initialMessages: [
          {
            role: "system",
            content: 
              "You are an interview preparation agent called 'The Old Grasshopper', assisting in a real-time setting. " +
              "I will ask you questions to understand how best to help you with your interview preparation *now*. " +
              "First, please tell me what kind of interview *you* are preparing for, and how *you* would like to prep *in this session*. " +
              "I can ask *you* practice questions, give *you* feedback on *your* answers *as you speak*, " +
              "analyze the room *you* are in, and even describe what *you* are wearing! " +
              "Keep *your* responses brief and easy to understand. " +
              "When you detect I have finished speaking, it is your turn to respond. " +
              "If you need more clarity, please ask me a follow-up question. " +
              "When you finish speaking, I will wait to detect your pause before replying. " +
              "If you notice a gap and I'm not speaking, please prompt me to continue. " +
              "Remember, my responses will be converted to audio, so only use '!' or '?' for special characters!"
          },
          {
            role: "user",
            content: "Hi, I'm here to prepare for an interview."
          }
        ],
        runOnConfig: true
      },
      callbacks: {
        onBotReady: () => {
          console.log("Bot is ready!");
          toast.success("Interview assistant is ready!");
          setIsConnected(true);
        },
        onError: (error) => {
          console.error("Bot error:", error);
          toast.error("Error connecting to interview assistant");
          setIsConnected(false);
        },
        onDisconnected: () => {
          console.log("Bot disconnected");
          toast.info("Interview assistant disconnected");
          setIsConnected(false);
        }
      }
    });

    setVoiceClient(client);

    try {
      await client.connect();
    } catch (e) {
      console.error(e);
      toast.error("Failed to start interview assistant");
      client.disconnect();
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
            >
              {isMicEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCam}
              className={isCamEnabled ? "bg-primary text-white" : ""}
            >
              {isCamEnabled ? <Video /> : <VideoOff />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {!isConnected ? (
            <Button onClick={initializeClient} className="w-full">
              Start Interview Prep
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