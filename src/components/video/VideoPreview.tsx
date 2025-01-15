import { useEffect, useRef } from "react";
import DailyIframe, { DailyCall, DailyEventObjectFatalError } from "@daily-co/daily-js";
import { VideoPreviewProps } from "./types";
import { toast } from "sonner";

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

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
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
            zIndex: '1',
          },
        });

        console.log("Daily frame created, loading...");
        await callFrameRef.current.load();
        console.log("Daily frame loaded, calling onCallFrameReady");
        
        callFrameRef.current.on('camera-error', () => {
          toast.error('Unable to access camera. Please check your permissions.');
        });

        callFrameRef.current.on('error', (event: DailyEventObjectFatalError) => {
          console.error('Daily.co error:', event);
          toast.error('An error occurred while connecting to the video call.');
        });

        callFrameRef.current.on('joining-meeting', () => {
          console.log('Joining meeting...');
        });

        callFrameRef.current.on('joined-meeting', () => {
          console.log('Successfully joined meeting');
          toast.success('Successfully joined meeting!');
        });

        onCallFrameReady(callFrameRef.current);
      } catch (error) {
        console.error("Error initializing call frame:", error);
        toast.error('Failed to initialize video call. Please try refreshing the page.');
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
      <div 
        ref={callWrapperRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};