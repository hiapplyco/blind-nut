
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { LoadingStates } from "@/components/chat/LoadingStates";
import { useChat } from "@/hooks/useChat";

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

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isGenerating={isGenerating}
          />
        </div>
      </Card>
    </div>
  );
};

export default Chat;
