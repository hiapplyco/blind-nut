import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";

interface VideoPreviewProps {
  onCallFrameReady: (callFrame: DailyCall) => void;
  settings: {
    showLeaveButton: boolean;
    showFullscreenButton: boolean;
    allowParticipantControls?: boolean;
  };
}

export const VideoPreview = ({ onCallFrameReady, settings }: VideoPreviewProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    const initializeCallFrame = async () => {
      callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
        showLeaveButton: settings.showLeaveButton,
        showFullscreenButton: settings.showFullscreenButton,
        showParticipantList: settings.allowParticipantControls,
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
          backgroundColor: 'white',
        },
        inputSettings: {
          audio: { enabled: true },
          video: { enabled: true },
          userName: { 
            isRequired: true
          }
        }
      });

      onCallFrameReady(callFrameRef.current);
    };

    initializeCallFrame();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [onCallFrameReady, settings]);

  return (
    <div className="flex-1 relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
      <div ref={callWrapperRef} className="w-full h-full" />
    </div>
  );
};