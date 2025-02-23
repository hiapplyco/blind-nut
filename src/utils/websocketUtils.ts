
import { WebSocket } from 'ws';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initializeWebSocketConnection = async () => {
  const { data: wsData, error: wsError } = await supabase.functions.invoke('initialize-daily-bot');
  if (wsError) throw wsError;
  return wsData.websocket_url;
};

export const setupWebSocketEventHandlers = (
  ws: WebSocket, 
  sessionId: number | null,
  onError?: (error: Event) => void
) => {
  ws.onopen = () => {
    console.log('WebSocket Connected');
    ws.send(JSON.stringify({
      setup: {
        generation_config: { response_modalities: ["TEXT"] }
      }
    }));
  };

  ws.onmessage = async (event) => {
    const response = JSON.parse(event.data);
    
    if (response.text && sessionId) {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: response.text
      });

      toast.success('Received response from assistant');
    }

    if (response.error) {
      toast.error(response.error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
    toast.error('Connection error occurred');
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
};
