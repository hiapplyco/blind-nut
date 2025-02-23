
import { useRef, useEffect } from 'react';
import { setupWebSocketEventHandlers, initializeWebSocketConnection } from '@/utils/websocketUtils';
import { toast } from "sonner";

export const useWebSocket = (sessionId: number | null) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const setupConnection = async () => {
      try {
        const websocketUrl = await initializeWebSocketConnection();
        const ws = new WebSocket(websocketUrl);
        wsRef.current = ws;

        setupWebSocketEventHandlers(ws, sessionId);
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        toast.error('Failed to initialize WebSocket connection');
      }
    };

    setupConnection();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  return wsRef;
};
