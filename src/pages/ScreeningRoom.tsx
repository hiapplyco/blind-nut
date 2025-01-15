import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

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
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Welcome to The Screening Room - Your virtual meeting space
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRoom;