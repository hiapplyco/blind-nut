import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall, DailyEvent, DailyEventObjectFatalError } from "@daily-co/daily-js";
import { VideoPreviewProps } from "./types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
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
        
        // Add event listeners for device permissions and connection states
        callFrameRef.current.on('camera-error', () => {
          toast.error('Unable to access camera. Please check your permissions.');
          setIsLoading(false);
        });

        callFrameRef.current.on('error', (event: DailyEventObjectFatalError) => {
          console.error('Daily.co error:', event);
          toast.error('An error occurred while connecting to the video call.');
          setIsLoading(false);
        });

        callFrameRef.current.on('joining-meeting', () => {
          toast.info('Joining meeting...');
        });

        callFrameRef.current.on('joined-meeting', () => {
          setIsLoading(false);
          toast.success('Successfully joined meeting!');
        });

        callFrameRef.current.on('left-meeting', () => {
          setIsLoading(false);
        });

        callFrameRef.current.on('loading', () => {
          setIsLoading(true);
          toast.info('Loading video call...');
        });

        callFrameRef.current.on('load-attempt-failed', () => {
          setIsLoading(false);
          toast.error('Failed to load video call. Please check your connection and try again.');
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
    </div>
  );
};