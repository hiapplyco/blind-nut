
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
}

export const useChat = (callId: number | null, mode: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!callId) return;

      try {
        const { data: kickoffCall, error: kickoffError } = await supabase
          .from('kickoff_calls')
          .select('*')
          .eq('id', callId)
          .single();

        if (kickoffError) throw kickoffError;

        // If the kickoff call exists but there's no summary yet, generate one
        if (kickoffCall && mode === 'kickoff') {
          setIsGenerating(true);
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('process-kickoff-call', {
            body: { 
              text: kickoffCall.content,
              title: kickoffCall.title,
              filePaths: kickoffCall.file_paths || []
            }
          });

          if (summaryError) throw summaryError;

          if (summaryData) {
            setMessages([{
              role: 'system',
              content: summaryData.summary,
              sources: summaryData.sources
            }]);
          }
          setIsGenerating(false);
        } else {
          // For non-kickoff mode, fetch existing summary
          const { data: summaryData, error: summaryError } = await supabase
            .from('kickoff_summaries')
            .select('*')
            .eq('call_id', callId)
            .maybeSingle();

          if (summaryError) throw summaryError;

          if (summaryData) {
            setMessages([{
              role: 'system',
              content: summaryData.content,
              sources: summaryData.sources
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching/generating summary:', error);
        toast.error('Failed to load or generate summary');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchSummary();
    } else {
      setIsLoading(false);
    }
  }, [callId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !callId) return;

    const userMessage = { role: 'user' as const, content: input };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      setIsLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ title: input.slice(0, 50), user_id: null }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionData.id,
          role: userMessage.role,
          content: userMessage.content
        }]);

      if (messageError) throw messageError;

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

  return {
    messages,
    input,
    setInput,
    isLoading,
    isGenerating,
    handleSubmit
  };
};
