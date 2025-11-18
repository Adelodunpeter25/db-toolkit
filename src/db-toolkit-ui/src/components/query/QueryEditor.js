import { Play, History } from 'lucide-react';
import { Button } from '../common/Button';

export function QueryEditor({ query, onChange, onExecute, loading }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">SQL Editor</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<History size={16} />}
          >
            History
          </Button>
          <Button
            size="sm"
            icon={<Play size={16} />}
            onClick={onExecute}
            disabled={loading || !query.trim()}
            loading={loading}
          >
            Execute
          </Button>
        </div>
      </div>
      <textarea
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your SQL query..."
        className="w-full h-48 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
