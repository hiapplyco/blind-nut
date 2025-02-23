
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useScreeningSession = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Authentication required');
        }

        const { data: chatSession, error: chatError } = await supabase
          .from('chat_sessions')
          .insert({
            title: `Interview Session ${new Date().toLocaleString()}`,
            status: 'active',
            user_id: session.user.id
          })
          .select()
          .single();

        if (chatError) throw chatError;
        setSessionId(chatSession.id);

      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat session');
      }
    };

    initializeChat();
  }, [navigate]);

  return { sessionId, setSessionId };
};
