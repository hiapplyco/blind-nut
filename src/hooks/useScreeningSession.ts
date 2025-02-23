
import { useState, useEffect, useCallback } from 'react';
import { createChatSession } from '@/utils/sessionUtils';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

export const useScreeningSession = () => {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { session } = useAuth();

  const initializeChat = useCallback(async () => {
    if (!session?.user) return;

    try {
      const chatSession = await createChatSession(session.user.id);
      setSessionId(chatSession.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat session');
    }
  }, [session?.user]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return { sessionId, setSessionId };
};
