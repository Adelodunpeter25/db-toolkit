import { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table } from 'lucide-react';

export function SchemaTree({ schema, onTableClick }) {
  const [expandedSchemas, setExpandedSchemas] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);

  const toggleSchema = (schemaName) => {
    setExpandedSchemas((prev) => ({ ...prev, [schemaName]: !prev[schemaName] }));
  };

  const handleTableClick = (schemaName, tableName) => {
    setSelectedTable(`${schemaName}.${tableName}`);
    onTableClick(schemaName, tableName);
  };

  if (!schema) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tables</h3>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        {Object.entries(schema).map(([schemaName, schemaData]) => {
          const tables = schemaData?.tables || [];
          return (
            <div key={schemaName}>
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700/50"
                onClick={() => toggleSchema(schemaName)}
              >
                {expandedSchemas[schemaName] ? 
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" /> : 
                  <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                }
                <Database size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{schemaName}</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-500">{tables.length}</span>
              </div>

              {expandedSchemas[schemaName] && (
                <div className="bg-gray-50 dark:bg-gray-900/30">
                  {tables.map((table) => {
                    const tableKey = `${schemaName}.${table.name}`;
                    const isSelected = selectedTable === tableKey;
                    return (
                      <div
                        key={table.name}
                        className={`flex items-center gap-2 pl-9 pr-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleTableClick(schemaName, table.name)}
                      >
                        <Table size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{table.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
