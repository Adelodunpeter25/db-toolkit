/**
 * Data grid component for displaying table data
 */
import { ChevronUp, ChevronDown, Eye } from 'lucide-react';

export function DataGrid({ data, columns, onSort, sortColumn, sortOrder, onCellClick }) {
  const handleSort = (column) => {
    const newOrder = sortColumn === column && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort(column, newOrder);
  };

  const isTruncated = (value) => {
    return typeof value === 'string' && value.endsWith('...');
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                onClick={() => handleSort(column)}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  {column}
                  {sortColumn === column && (
                    sortOrder === 'ASC' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map((column, colIndex) => {
                const value = row[colIndex];
                const truncated = isTruncated(value);
                
                return (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap group relative"
                  >
                    <div className="flex items-center gap-2">
                      {value !== null ? String(value) : <span className="text-gray-400">NULL</span>}
                      {truncated && (
                        <button
                          onClick={() => onCellClick(row, column, colIndex)}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          title="View full content"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
