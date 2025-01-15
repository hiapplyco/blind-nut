import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { VideoClosingAnimation } from "./VideoClosingAnimation";
import { VideoPreviewProps } from "./types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [showTurnOnAnimation, setShowTurnOnAnimation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    console.log("Initializing Daily call frame with URL:", roomUrl);

    const initializeCallFrame = async () => {
      try {
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          url: roomUrl,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
        });

        console.log("Daily frame created, loading...");
        await callFrameRef.current.load();
        console.log("Daily frame loaded, calling onCallFrameReady");
        
        // Add event listeners for device permissions
        callFrameRef.current.on('camera-error', () => {
          toast.error('Unable to access camera. Please check your permissions.');
          setIsLoading(false);
        });

        callFrameRef.current.on('mic-error', () => {
          toast.error('Unable to access microphone. Please check your permissions.');
          setIsLoading(false);
        });

        callFrameRef.current.on('joining-meeting', () => {
          toast.info('Joining meeting...');
        });

        callFrameRef.current.on('joined-meeting', () => {
          setIsLoading(false);
          toast.success('Successfully joined meeting!');
        });

        onCallFrameReady(callFrameRef.current);
      } catch (error) {
        console.error("Error initializing call frame:", error);
        toast.error('Failed to initialize video call. Please try refreshing the page.');
        setIsLoading(false);
      }
    };

    initializeCallFrame();

    return () => {
      if (callFrameRef.current) {
        console.log("Cleaning up Daily frame");
        callFrameRef.current.destroy();
      }
    };
  }, [onCallFrameReady, roomUrl]);

  const handleTurnOnComplete = () => {
    console.log("Turn on animation complete");
    setShowTurnOnAnimation(false);
  };

  return (
    <div className="absolute inset-0">
      <div ref={callWrapperRef} className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Initializing video call...
              </p>
            </div>
          </div>
        )}
      </div>
      <VideoClosingAnimation 
        isVisible={showTurnOnAnimation}
        onAnimationComplete={handleTurnOnComplete}
        mode="turnOn"
      />
    </div>
  );
};