import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";

interface VideoPreviewProps {
  onCallFrameReady: (callFrame: DailyCall) => void;
  roomUrl: string;
}

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    const initializeCallFrame = async () => {
      try {
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          url: roomUrl,
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
  }, [onCallFrameReady, roomUrl]);

  return (
    <div className="flex-1 relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
      <div ref={callWrapperRef} className="w-full h-full" />
    </div>
  );
};