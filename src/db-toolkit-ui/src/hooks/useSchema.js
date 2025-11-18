import { useState, useCallback } from 'react';
import { schemaAPI } from '../services/api';

export function useSchema(connectionId) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchemaTree = useCallback(async (useCache = true) => {
    if (!connectionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await schemaAPI.getTree(connectionId, useCache);
      setSchema(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  const fetchTableInfo = useCallback(async (schemaName, tableName) => {
    if (!connectionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await schemaAPI.getTableInfo(connectionId, schemaName, tableName);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  const refreshSchema = useCallback(async () => {
    if (!connectionId) return;
    
    setLoading(true);
    setError(null);
    try {
      await schemaAPI.refresh(connectionId);
      await fetchSchemaTree(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId, fetchSchemaTree]);

  return {
    schema,
    loading,
    error,
    fetchSchemaTree,
    fetchTableInfo,
    refreshSchema,
  };
}
