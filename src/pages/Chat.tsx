
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const callId = searchParams.get('callId');
  const mode = searchParams.get('mode');

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          {mode === 'kickoff' ? 'Kickoff Call Chat' : 'Chat'}
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Chat interface coming soon! Call ID: {callId}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
