
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSectionProps {
  messages: Message[];
  inputText: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatSection = ({
  messages,
  inputText,
  isLoading,
  onInputChange,
  onSubmit
}: ChatSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'assistant' 
                ? 'bg-primary/10 ml-4' 
                : 'bg-muted mr-4'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your response..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !inputText.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
};

