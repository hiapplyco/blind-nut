
import { supabase } from "@/integrations/supabase/client";

export const createChatSession = async (userId: string) => {
  const { data: chatSession, error: chatError } = await supabase
    .from('chat_sessions')
    .insert({
      title: `Interview Session ${new Date().toLocaleString()}`,
      status: 'active',
      user_id: userId
    })
    .select()
    .single();

  if (chatError) throw chatError;
  return chatSession;
};

