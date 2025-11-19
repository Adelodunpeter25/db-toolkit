import { useEffect, useRef, useState } from 'react';

export function useMigratorStream(onOutput) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/ws/migrator');

    ws.onopen = () => {
      setIsConnected(true);
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'stdout' || data.type === 'stderr') {
        onOutput(data.data, data.type === 'stderr' ? 'error' : 'info');
      } else if (data.type === 'exit') {
        setIsRunning(false);
        onOutput(`Command exited with code ${data.code}`, data.success ? 'success' : 'error');
      } else if (data.type === 'error') {
        setIsRunning(false);
        onOutput(`Error: ${data.data}`, 'error');
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      setIsRunning(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsRunning(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [onOutput]);

  const executeCommand = (command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsRunning(true);
      wsRef.current.send(JSON.stringify({ command }));
    }
  };

  return { executeCommand, isConnected, isRunning };
}
