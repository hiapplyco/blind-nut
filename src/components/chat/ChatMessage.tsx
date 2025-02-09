
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
}

export const ChatMessage = ({ role, content, sources }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg",
        role === 'user' ? "ml-8 bg-white border-2 border-black" :
        role === 'assistant' ? "mr-8 bg-purple-50" :
        "bg-yellow-100 border-2 border-dashed border-yellow-300"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {role === 'user' ? (
            <User className="h-5 w-5 text-gray-600" />
          ) : (
            <Bot className="h-5 w-5 text-purple-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
          {sources && sources.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Sources:</span>
              <ul className="list-disc list-inside">
                {sources.map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
