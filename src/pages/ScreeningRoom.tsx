import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { DailyProvider, DailyPrebuilt } from "@daily-co/daily-react";

const ROOM_URL = "https://hiapplyco.daily.co/lovable";

const ScreeningRoom = () => {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFFBF4]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            The Screening Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <DailyProvider>
              <DailyPrebuilt
                url={ROOM_URL}
                showLeaveButton={true}
                showFullscreenButton={true}
                iframeStyle={{
                  width: "100%",
                  height: "100%",
                  border: "0",
                  backgroundColor: "white",
                }}
              />
            </DailyProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRoom;