import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { VideoClosingAnimation } from "./VideoClosingAnimation";
import { VideoPreviewProps } from "./types";

export const VideoPreview = ({ onCallFrameReady, roomUrl }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [showTurnOnAnimation, setShowTurnOnAnimation] = useState(true);

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
        onCallFrameReady(callFrameRef.current);
      } catch (error) {
        console.error("Error initializing call frame:", error);
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
      <div ref={callWrapperRef} className="w-full h-full" />
      <VideoClosingAnimation 
        isVisible={showTurnOnAnimation}
        onAnimationComplete={handleTurnOnComplete}
        mode="turnOn"
      />
    </div>
  );
};