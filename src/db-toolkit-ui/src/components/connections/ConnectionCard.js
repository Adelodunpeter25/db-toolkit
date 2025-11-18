import { Database, Trash2, Play } from 'lucide-react';
import { Button } from '../common/Button';

export function ConnectionCard({ connection, onConnect, onDelete }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex items-start gap-3 mb-4">
        <Database className="text-blue-600 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{connection.name}</h3>
          <p className="text-sm text-gray-600">{connection.db_type}</p>
          {connection.host && (
            <p className="text-xs text-gray-500 mt-1">
              {connection.host}:{connection.port}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          icon={<Play size={16} />}
          onClick={() => onConnect(connection.id)}
          className="flex-1"
        >
          Connect
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={16} />}
          onClick={() => onDelete(connection.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
