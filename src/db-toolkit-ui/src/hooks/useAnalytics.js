/**
 * Hook for real-time analytics via WebSocket
 */
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { WS_ENDPOINTS } from '../services/websocket';
import api from '../services/api';

export function useAnalytics(connectionId) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const wsRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!connectionId) return;

    setLoading(true);
    const ws = new WebSocket(WS_ENDPOINTS.ANALYTICS);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ connection_id: connectionId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      if (data.success) {
        setAnalytics(data);
        setHistory(prev => [...prev.slice(-19), {
          timestamp: new Date(),
          cpu: data.system_stats.cpu_usage,
          memory: data.system_stats.memory_usage,
          connections: data.active_connections
        }]);
        setLoading(false);
      }
    };

    ws.onerror = () => {
      toast.error('WebSocket connection failed');
      setLoading(false);
    };

    ws.onclose = () => {
      setLoading(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connectionId]);

  const killQuery = async (pid) => {
    try {
      const response = await api.post(`/analytics/connections/${connectionId}/kill`, { pid });
      
      if (response.data.success) {
        toast.success('Query terminated');
      } else {
        toast.error(response.data.error || 'Failed to kill query');
      }
    } catch (err) {
      toast.error('Failed to kill query');
    }
  };

  return { analytics, loading, history, killQuery };
}
