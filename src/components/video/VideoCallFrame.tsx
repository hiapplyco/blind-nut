import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyCall } from "@daily-co/daily-js";
import { toast } from "sonner";
import { RecordingManager } from "./RecordingManager";
import { MeetingTokenManager } from "./MeetingTokenManager";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

interface VideoCallFrameProps {
  onJoinMeeting: () => void;
  onParticipantJoined: (participant: { id: string; name?: string }) => void;
  onParticipantLeft: (participant: { id: string }) => void;
  onLeaveMeeting: () => void;
  onRecordingStarted: (recordingId: string) => void;
}

export const VideoCallFrame = ({
  onJoinMeeting,
  onParticipantJoined,
  onParticipantLeft,
  onLeaveMeeting,
  onRecordingStarted,
}: VideoCallFrameProps) => {
  const callWrapperRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [isCallFrameReady, setIsCallFrameReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState({
    allowParticipantControls: true,
    showFullscreenButton: true,
    showLeaveButton: true,
  });

  const ROOM_URL = "https://hiapplyco.daily.co/lovable";
  const meetingTokenManager = MeetingTokenManager();
  const recordingManager = RecordingManager({
    callFrame: callFrameRef.current,
    isCallFrameReady,
    isRecording,
    setIsRecording
  });

  const joinMeeting = async () => {
    try {
      if (!callFrameRef.current) return;
      
      const token = await meetingTokenManager.createMeetingToken();
      await callFrameRef.current.join({ 
        url: ROOM_URL,
        token
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    }
  };

  useEffect(() => {
    if (!callWrapperRef.current || callFrameRef.current) return;

    const initializeCallFrame = async () => {
      try {
        callFrameRef.current = DailyIframe.createFrame(callWrapperRef.current, {
          showLeaveButton: settings.showLeaveButton,
          showFullscreenButton: settings.showFullscreenButton,
          iframeStyle: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            border: '0',
            backgroundColor: 'white',
          },
        });

        callFrameRef.current.on('joined-meeting', () => {
          console.log('Joined meeting, call frame ready');
          setIsCallFrameReady(true);
          onJoinMeeting();
          setTimeout(() => {
            if (!isRecording) {
              recordingManager.startRecording();
            }
          }, 1000);
        });

        callFrameRef.current.on('recording-started', (event) => {
          console.log('Recording started:', event);
          if (event.recordingId) {
            onRecordingStarted(event.recordingId);
          }
        });

        callFrameRef.current.on('participant-joined', (event) => {
          onParticipantJoined({
            id: event.participant.user_id,
            name: event.participant.user_name
          });
        });

        callFrameRef.current.on('participant-left', (event) => {
          onParticipantLeft({ id: event.participant.user_id });
        });

        callFrameRef.current.on('left-meeting', onLeaveMeeting);

      } catch (error) {
        console.error('Error initializing call frame:', error);
        toast.error('Failed to initialize video call');
      }
    };

    initializeCallFrame();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [onJoinMeeting, onParticipantJoined, onParticipantLeft, onLeaveMeeting, onRecordingStarted, settings]);

  if (showSettings) {
    return (
      <div className="flex gap-6 w-full h-full">
        <div className="flex-1 relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
          <div ref={callWrapperRef} className="w-full h-full" />
        </div>
        <Card className="w-80 p-6 space-y-6 h-fit">
          <h3 className="text-lg font-semibold">Room Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="participant-controls">Allow Participant Controls</Label>
              <Switch
                id="participant-controls"
                checked={settings.allowParticipantControls}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowParticipantControls: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fullscreen">Show Fullscreen Button</Label>
              <Switch
                id="fullscreen"
                checked={settings.showFullscreenButton}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showFullscreenButton: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leave">Show Leave Button</Label>
              <Switch
                id="leave"
                checked={settings.showLeaveButton}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showLeaveButton: checked }))
                }
              />
            </div>
          </div>
          <Button 
            onClick={joinMeeting}
            className="w-full mt-6"
          >
            Join Meeting
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div ref={callWrapperRef} className="w-full h-full relative" style={{ minHeight: '400px' }} />
  );
};