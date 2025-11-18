import { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Columns } from 'lucide-react';

export function SchemaTree({ schema, onTableClick }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!schema) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {Object.entries(schema).map(([schemaName, tables]) => (
        <div key={schemaName} className="mb-2">
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => toggle(schemaName)}
          >
            {expanded[schemaName] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Database size={16} className="text-blue-600" />
            <span className="font-medium">{schemaName}</span>
          </div>

          {expanded[schemaName] && (
            <div className="ml-6">
              {tables.map((table) => (
                <div
                  key={table}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => onTableClick(schemaName, table)}
                >
                  <Table size={16} className="text-green-600" />
                  <span className="text-sm">{table}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
