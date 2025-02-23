
import { useState, useEffect } from 'react';
import { createChatSession, getUserSession } from '@/utils/sessionUtils';
import { toast } from "sonner";

export const useScreeningSession = () => {
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = await getUserSession();
        const chatSession = await createChatSession(session.user.id);
        setSessionId(chatSession.id);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat session');
      }
    };

    initializeChat();
  }, []);

  return { sessionId, setSessionId };
};
