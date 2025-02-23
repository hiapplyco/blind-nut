
import { supabase } from "@/integrations/supabase/client";

export const createChatSession = async (userId: string) => {
  const title = `Interview Session ${new Date().toLocaleString()}`;
  
  const { data: chatSession, error: chatError } = await supabase
    .from('chat_sessions')
    .insert({
      title,
      status: 'active',
      user_id: userId
    })
    .select()
    .single();

  if (chatError) {
    console.error('Error creating chat session:', chatError);
    throw chatError;
  }

  return chatSession;
};
