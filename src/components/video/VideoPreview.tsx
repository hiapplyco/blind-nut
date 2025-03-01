
import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall, DailyEventObjectFatalError } from "@daily-co/daily-js";
import { VideoPreviewProps } from "./types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up any existing callFrame before creating a new one
    if (callFrameRef.current) {
      console.log("Cleaning up existing Daily frame");
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    if (!callWrapperRef.current) return;
    
    // If we don't have a room URL yet, don't try to initialize the call frame
    if (!roomUrl) {
      console.log("No room URL provided, waiting for URL");
      setIsLoading(true);
      return;
    }

    console.log("Initializing Daily call frame with URL:", roomUrl);

    const initializeCallFrame = async () => {
      try {
        setIsLoading(true);
        
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          url: roomUrl,
          theme: {
            colors: {
              accent: '#9b87f5',        // Primary purple
              accentText: '#FFFFFF',    // White text on purple
              background: '#F8F5FF',    // Light purple background
              backgroundAccent: '#EDE9FF', // Slightly darker purple background
              baseText: '#4A2B1C',      // Dark brown text
              border: '#7E69AB',        // Secondary purple
              mainAreaBg: '#2C1810',    // Dark brown main area
              mainAreaBgAccent: '#4A2B1C', // Medium brown tiles
              mainAreaText: '#FFFFFF',   // White text in main area
              supportiveText: '#8B6B5C', // Light brown supportive text
            },
          },
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

        callFrameRef.current.on('recording-started', (event: any) => {
          console.log('Recording started:', event);
        });

        callFrameRef.current.on('recording-stopped', (event: any) => {
          console.log('Recording stopped:', event);
        });

        callFrameRef.current.on('recording-error', (event: any) => {
          console.error('Recording error:', event);
          toast.error('Recording error occurred');
        });

        callFrameRef.current.on('left-meeting', () => {
          toast.info('You have left the meeting');
        });

        setIsLoading(false);
        onCallFrameReady(callFrameRef.current);
      } catch (error) {
        console.error("Error initializing call frame:", error);
        setIsLoading(false);
        // Don't show toast here as it might be too frequent
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
      {isLoading && !roomUrl && (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
          <Loader2 className="h-10 w-10 text-[#9b87f5] animate-spin mb-4" />
          <p className="text-gray-600">Initializing video room...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}
      <div 
        ref={callWrapperRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};
