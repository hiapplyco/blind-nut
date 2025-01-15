import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MediaControls } from "@/components/interview/MediaControls";
import { useInterviewBot } from "@/hooks/useInterviewBot";

const InterviewPrep = () => {
  const {
    isConnected,
    isMicEnabled,
    isCamEnabled,
    isLoading,
    error,
    initializeClient,
    toggleMic,
    toggleCam,
    disconnect
  } = useInterviewBot();

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <MediaControls
            isMicEnabled={isMicEnabled}
            isCamEnabled={isCamEnabled}
            isConnected={isConnected}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {!isConnected ? (
            <Button 
              onClick={initializeClient} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Start Interview Prep"}
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive" className="w-full">
              End Session
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Speaking with: The Old Grasshopper
              <br />
              Start by telling me what kind of interview you're preparing for!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InterviewPrep;