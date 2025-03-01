
import { useRef, useEffect } from 'react';
import { setupWebSocketEventHandlers, initializeWebSocketConnection } from '@/utils/websocketUtils';

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
        // Don't show toast for connection errors
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
