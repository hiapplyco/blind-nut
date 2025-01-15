import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { VideoClosingAnimation } from "./VideoClosingAnimation";

interface VideoPreviewProps {
  onCallFrameReady: (callFrame: DailyCall) => void;
  roomUrl: string;
}

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [showTurnOnAnimation, setShowTurnOnAnimation] = useState(true);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

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

  const handleTurnOnComplete = () => {
    setShowTurnOnAnimation(false);
  };

  return (
    <div className="absolute inset-0">
      <div ref={callWrapperRef} className="w-full h-full" />
      <VideoClosingAnimation 
        isVisible={showTurnOnAnimation}
        onAnimationComplete={handleTurnOnComplete}
        mode="turnOn"
      />
    </div>
  );
};