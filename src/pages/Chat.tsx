
import { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2, Bot, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
}

const Chat = () => {
  const [searchParams] = useSearchParams();
  const callId = searchParams.get('callId');
  const mode = searchParams.get('mode');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch initial summary and data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!callId) return;

      try {
        const { data, error } = await supabase
          .from('kickoff_summaries')
          .select('*')
          .eq('call_id', callId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setMessages([{
            role: 'system',
            content: data.content,
            sources: data.sources
          }]);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        toast.error('Failed to load summary');
      } finally {
        setIsLoading(false);
      }
    };

    const generateInitialSummary = async () => {
      if (!callId) return;
      
      setIsGenerating(true);
      try {
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('process-kickoff-call', {
          body: { callId }
        });

        if (summaryError) throw summaryError;

        if (summaryData) {
          setMessages([{
            role: 'system',
            content: summaryData.summary,
            sources: summaryData.sources
          }]);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
        toast.error('Failed to generate summary');
      } finally {
        setIsGenerating(false);
        setIsLoading(false);
      }
    };

    if (callId) {
      if (mode === 'kickoff') {
        generateInitialSummary();
      } else {
        fetchSummary();
      }
    } else {
      setIsLoading(false);
    }
  }, [callId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !callId) return;

    const userMessage = { role: 'user' as const, content: input };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      setIsLoading(true);

      // Create chat session if first message
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ title: input.slice(0, 50), user_id: null }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save user message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionData.id,
          role: userMessage.role,
          content: userMessage.content
        }]);

      if (messageError) throw messageError;

      // Get AI response
      const { data: responseData, error: responseError } = await supabase.functions.invoke('process-chat-message', {
        body: {
          callId,
          sessionId: sessionData.id,
          message: input,
          history: messages
        }
      });

      if (responseError) throw responseError;

      const assistantMessage = {
        role: 'assistant' as const,
        content: responseData.response,
        sources: responseData.sources
      };

      // Save assistant message
      const { error: assistantError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionData.id,
          role: assistantMessage.role,
          content: assistantMessage.content
        }]);

      if (assistantError) throw assistantError;

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          {mode === 'kickoff' ? 'Kickoff Call Assistant' : 'Data Chat'}
        </h1>

        <div className="space-y-6">
          {/* Loading States */}
          {isGenerating && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <span className="text-yellow-700">Generating initial summary...</span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === 'user' ? "ml-8 bg-white border-2 border-black" :
                  message.role === 'assistant' ? "mr-8 bg-purple-50" :
                  "bg-yellow-100 border-2 border-dashed border-yellow-300"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Bot className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Sources:</span>
                        <ul className="list-disc list-inside">
                          {message.sources.map((source, i) => (
                            <li key={i}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                <span className="text-gray-700">Thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask questions about your data..."
              className="border-2 border-black rounded-lg p-4 resize-none"
              rows={3}
              disabled={isLoading || isGenerating}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className={cn(
                  "bg-purple-600 text-white hover:bg-purple-700",
                  "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                )}
                disabled={isLoading || isGenerating || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
