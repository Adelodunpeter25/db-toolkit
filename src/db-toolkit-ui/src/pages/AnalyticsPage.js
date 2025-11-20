/**
 * Analytics page for database monitoring
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, RefreshCw } from 'lucide-react';
import { useConnections } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { AnalyticsStats } from '../components/analytics/AnalyticsStats';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { CurrentQueries } from '../components/analytics/CurrentQueries';
import { LongRunningQueries } from '../components/analytics/LongRunningQueries';
import { BlockedQueries } from '../components/analytics/BlockedQueries';
import { pageTransition } from '../utils/animations';
import api from '../services/api';

function AnalyticsPage() {
  const navigate = useNavigate();
  const { connections, connectToDatabase } = useConnections();
  const toast = useToast();
  const [connectionId, setConnectionId] = useState(null);
  const [connectionName, setConnectionName] = useState('');
  const [connecting, setConnecting] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [history, setHistory] = useState([]);

  const handleConnect = async (id) => {
    setConnecting(id);
    try {
      await connectToDatabase(id);
      const conn = connections.find(c => c.id === id);
      setConnectionId(id);
      setConnectionName(conn?.name || '');
      toast.success('Connected successfully');
    } catch (err) {
      toast.error('Failed to connect');
    } finally {
      setConnecting(null);
    }
  };

  const fetchAnalytics = async () => {
    if (!connectionId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/analytics/connections/${connectionId}`);
      if (response.data.success) {
        setAnalytics(response.data);
        setHistory(prev => [...prev.slice(-19), {
          timestamp: new Date(),
          cpu: response.data.system_stats.cpu_usage,
          memory: response.data.system_stats.memory_usage,
          connections: response.data.active_connections
        }]);
      } else {
        toast.error(response.data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleKillQuery = async (pid) => {
    try {
      const response = await api.post(`/analytics/connections/${connectionId}/kill`, { pid });
      if (response.data.success) {
        toast.success('Query terminated');
        fetchAnalytics();
      } else {
        toast.error(response.data.error || 'Failed to kill query');
      }
    } catch (err) {
      toast.error('Failed to kill query');
    }
  };

  useEffect(() => {
    if (connectionId) {
      fetchAnalytics();
    }
  }, [connectionId]);

  useEffect(() => {
    if (connectionId && autoRefresh) {
      const interval = setInterval(fetchAnalytics, 5000);
      return () => clearInterval(interval);
    }
  }, [connectionId, autoRefresh]);

  if (!connectionId) {
    if (connections.length === 0) {
      return (
        <motion.div className="p-8 flex items-center justify-center h-full" {...pageTransition}>
          <div className="text-center max-w-md">
            <Database className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Connections</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a database connection first to view analytics
            </p>
            <Button onClick={() => navigate('/connections')}>
              Create Connection
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div className="p-8" {...pageTransition}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Database Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Select a connection to view analytics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-4">
                <Database className="text-blue-600 dark:text-blue-400 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{conn.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{conn.db_type}</p>
                  {conn.host && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {conn.host}:{conn.port}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleConnect(conn.id)}
                disabled={connecting === conn.id}
                className="w-full !text-white"
              >
                {connecting === conn.id ? 'Connecting...' : 'Connect & Monitor'}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="h-screen flex flex-col" {...pageTransition}>
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Database Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{connectionName}</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Auto-refresh (5s)
            </label>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={16} />}
              onClick={fetchAnalytics}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConnectionId(null)}
            >
              Change Connection
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading && !analytics ? (
          <LoadingState message="Loading analytics..." />
        ) : analytics ? (
          <div className="space-y-6">
            <AnalyticsStats analytics={analytics} />
            <AnalyticsCharts history={history} />
            <CurrentQueries queries={analytics.current_queries} onKill={handleKillQuery} />
            <LongRunningQueries queries={analytics.long_running_queries} onKill={handleKillQuery} />
            <BlockedQueries queries={analytics.blocked_queries} />
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No analytics data available
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AnalyticsPage;
