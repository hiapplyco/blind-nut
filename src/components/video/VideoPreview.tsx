import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";

interface VideoPreviewProps {
  onCallFrameReady: (callFrame: DailyCall) => void;
  onJoinMeeting: () => void;
}

export const VideoPreview = ({ onCallFrameReady, onJoinMeeting }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    const initializeCallFrame = async () => {
      try {
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        await callFrameRef.current.load();
        onCallFrameReady(callFrameRef.current);
      } catch (error) {
        console.error("Error initializing call frame:", error);
      }
    };

    initializeCallFrame();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [onCallFrameReady]);

  return (
    <div className="flex-1 relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
      <div ref={callWrapperRef} className="w-full h-full" />
      <button 
        onClick={onJoinMeeting}
        className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
      >
        Join Meeting
      </button>
    </div>
  );
};