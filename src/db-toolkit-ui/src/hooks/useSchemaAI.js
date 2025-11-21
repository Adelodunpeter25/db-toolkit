/**
 * Hook for Schema AI analysis with IndexedDB caching
 */
import { useState, useCallback } from 'react';
import { schemaAiAPI } from '../services/api';
import { indexedDBService } from '../services/indexedDB';
import { INDEXEDDB_CONFIG } from '../utils/constants';

export function useSchemaAI(connectionId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSchema = useCallback(async (schemaName, forceRefresh = false) => {
    if (!connectionId || !schemaName) {
      setError('Connection ID and schema name required');
      return null;
    }

    const cacheKey = `${connectionId}_${schemaName}`;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (!forceRefresh) {
        const cached = await indexedDBService.get(
          INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS,
          cacheKey
        );
        if (cached) {
          setLoading(false);
          return cached.data;
        }
      }

      // Fetch from API
      const response = await schemaAiAPI.analyzeSchema(connectionId, schemaName);
      const result = response.data;

      // Cache the result
      await indexedDBService.set(
        INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS,
        cacheKey,
        result
      );

      setLoading(false);
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
      throw err;
    }
  }, [connectionId]);

  const analyzeTable = useCallback(async (schemaName, tableName, forceRefresh = false) => {
    if (!connectionId || !schemaName || !tableName) {
      setError('Connection ID, schema name, and table name required');
      return null;
    }

    const cacheKey = `${connectionId}_${schemaName}_${tableName}`;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (!forceRefresh) {
        const cached = await indexedDBService.get(
          INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS,
          cacheKey
        );
        if (cached) {
          setLoading(false);
          return cached.data;
        }
      }

      // Fetch from API
      const response = await schemaAiAPI.analyzeTable(connectionId, schemaName, tableName);
      const result = response.data;

      // Cache the result
      await indexedDBService.set(
        INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS,
        cacheKey,
        result
      );

      setLoading(false);
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
      throw err;
    }
  }, [connectionId]);

  const clearCache = useCallback(async (type = 'all') => {
    try {
      if (type === 'schema' || type === 'all') {
        await indexedDBService.clear(INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS);
      }
      if (type === 'table' || type === 'all') {
        await indexedDBService.clear(INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS);
      }
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, []);

  return {
    loading,
    error,
    analyzeSchema,
    analyzeTable,
    clearCache
  };
}
