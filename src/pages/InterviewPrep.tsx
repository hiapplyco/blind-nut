import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MediaControls } from "@/components/interview/MediaControls";
import { useInterviewBot } from "@/hooks/useInterviewBot";

const InterviewPrep = () => {
  const {
    isConnected,
    isLoading,
    error,
    initializeClient,
    disconnect,
    videoRef,
    canvasRef
  } = useInterviewBot();

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <MediaControls
            isConnected={isConnected}
            onEndCall={disconnect}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!isConnected ? (
            <Button 
              onClick={initializeClient}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Start Interview Prep"}
            </Button>
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Connected to Gemini AI Assistant
                <br />
                Start by telling me what kind of interview you're preparing for!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InterviewPrep;