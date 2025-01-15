import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

interface RoomSettingsProps {
  settings: {
    allowParticipantControls: boolean;
    showFullscreenButton: boolean;
    showLeaveButton: boolean;
  };
  onSettingsChange: (settings: any) => void;
  onJoinMeeting: () => void;
}

export const RoomSettings = ({
  settings,
  onSettingsChange,
  onJoinMeeting,
}: RoomSettingsProps) => {
  return (
    <Card className="w-80 p-6 space-y-6 h-fit">
      <h3 className="text-lg font-semibold">Room Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="participant-controls">Allow Participant Controls</Label>
          <Switch
            id="participant-controls"
            checked={settings.allowParticipantControls}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, allowParticipantControls: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="fullscreen">Show Fullscreen Button</Label>
          <Switch
            id="fullscreen"
            checked={settings.showFullscreenButton}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, showFullscreenButton: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="leave">Show Leave Button</Label>
          <Switch
            id="leave"
            checked={settings.showLeaveButton}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, showLeaveButton: checked })
            }
          />
        </div>
      </div>
      <Button onClick={onJoinMeeting} className="w-full mt-6">
        Join Meeting
      </Button>
    </Card>
  );
};