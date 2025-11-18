import { useState, useCallback } from 'react';
import { queryAPI } from '../services/api';

export function useQuery(connectionId) {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async (query, limit = 1000, offset = 0, timeout = 30) => {
    if (!connectionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await queryAPI.execute(connectionId, {
        query,
        limit,
        offset,
        timeout,
      });
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  const fetchHistory = useCallback(async () => {
    if (!connectionId) return;
    
    try {
      const response = await queryAPI.getHistory(connectionId);
      setHistory(response.data.history || []);
      return response.data.history;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [connectionId]);

  const clearHistory = useCallback(async () => {
    if (!connectionId) return;
    
    try {
      await queryAPI.clearHistory(connectionId);
      setHistory([]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [connectionId]);

  return {
    result,
    history,
    loading,
    error,
    executeQuery,
    fetchHistory,
    clearHistory,
  };
}
