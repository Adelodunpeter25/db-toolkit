/**
 * Analytics charts with Recharts
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export function AnalyticsCharts({ history, timeRange }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">No historical data available</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = history.map(item => ({
    time: formatTime(item.timestamp),
    cpu: parseFloat(item.cpu.toFixed(1)),
    memory: parseFloat(item.memory.toFixed(1)),
    connections: item.connections
  }));

  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const axisColor = isDark ? '#9CA3AF' : '#6B7280';
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = isDark ? '#374151' : '#E5E7EB';
  const tooltipText = isDark ? '#F3F4F6' : '#111827';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">CPU Usage (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="time" 
              stroke={axisColor} 
              tick={{ fontSize: 10, fill: axisColor }}
              interval="preserveStartEnd"
            />
            <YAxis stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: tooltipText
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#F97316" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Memory Usage (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="time" 
              stroke={axisColor} 
              tick={{ fontSize: 10, fill: axisColor }}
              interval="preserveStartEnd"
            />
            <YAxis stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: tooltipText
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#A855F7" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Connections</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="time" 
              stroke={axisColor} 
              tick={{ fontSize: 10, fill: axisColor }}
              interval="preserveStartEnd"
            />
            <YAxis stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: tooltipText
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Line 
              type="monotone" 
              dataKey="connections" 
              stroke="#22C55E" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
