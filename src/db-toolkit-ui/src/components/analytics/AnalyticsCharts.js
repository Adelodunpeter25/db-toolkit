/**
 * Analytics charts for real-time monitoring
 */
export function AnalyticsCharts({ history }) {
  if (history.length === 0) {
    return null;
  }

  const maxValue = (data, key) => Math.max(...data.map(d => d[key] || 0));

  const renderChart = (title, dataKey, color) => {
    const max = maxValue(history, dataKey);
    const points = history.map((item, index) => {
      const x = (index / (history.length - 1)) * 100;
      const y = 100 - ((item[dataKey] || 0) / (max || 1)) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
          </svg>
          <div className="absolute top-0 right-0 text-xs text-gray-500 dark:text-gray-400">
            {history[history.length - 1]?.[dataKey]?.toFixed(1) || 0}
            {dataKey === 'connections' ? '' : '%'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderChart('CPU Usage', 'cpu', '#f97316')}
      {renderChart('Memory Usage', 'memory', '#a855f7')}
      {renderChart('Active Connections', 'connections', '#22c55e')}
    </div>
  );
}
