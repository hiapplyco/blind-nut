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
          iframeStyle: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
          layout: {
            fillView: true,
            fitType: 'fill',
          },
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
    <div className="w-full h-full absolute inset-0 bg-muted rounded-lg overflow-hidden">
      <div ref={callWrapperRef} className="w-full h-full absolute inset-0" />
    </div>
  );
};