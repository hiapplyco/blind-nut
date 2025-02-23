
import { useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWebSocket = (sessionId: number | null) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        const { data: wsData, error: wsError } = await supabase.functions.invoke('initialize-daily-bot');
        if (wsError) throw wsError;

        const ws = new WebSocket(wsData.websocket_url);
        wsRef.current = ws;

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
          toast.error('Connection error occurred');
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        toast.error('Failed to initialize WebSocket connection');
      }
    };

    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  return wsRef;
};
