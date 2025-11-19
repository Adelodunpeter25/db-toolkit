import { useEffect, useRef } from 'react';
import { WS_ENDPOINTS } from '../services/websocket';

export function useBackupWebSocket(onUpdate) {
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(WS_ENDPOINTS.BACKUPS);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'backup_update') {
        onUpdate(data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [onUpdate]);

  return wsRef;
}
