
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { LoadingStates } from "@/components/chat/LoadingStates";
import { useChat } from "@/hooks/useChat";
import { LockIcon, AlertCircle } from "lucide-react";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const callIdParam = searchParams.get('callId');
  const callId = callIdParam ? parseInt(callIdParam, 10) : null;
  const mode = searchParams.get('mode');
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    isGenerating,
    handleSubmit
  } = useChat(callId, mode);

  // Disabled chat submit handler that does nothing
  const handleDisabledSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8 relative">
      {/* Gray overlay */}
      <div className="absolute inset-0 bg-gray-500/40 z-10 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
          <LockIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Feature Unavailable</h2>
          <p className="text-gray-600">
            The chat feature is currently disabled. Please check back later.
          </p>
        </div>
      </div>

      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-50">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          {mode === 'kickoff' ? 'Kickoff Call Assistant' : 'Data Chat'}
        </h1>

        <div className="space-y-6">
          <LoadingStates 
            isGenerating={isGenerating}
            isLoading={isLoading}
            hasMessages={messages.length > 0}
          />

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            handleSubmit={handleDisabledSubmit}
            isLoading={true} // Force disabled state
            isGenerating={true} // Force disabled state
          />
        </div>
      </Card>
    </div>
  );
};

export default Chat;
