import { useEffect, useState } from 'react';
import { Columns, Key, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchema } from '../../hooks';
import { useSchemaAI } from '../../hooks/useSchemaAI';
import { useToast } from '../../contexts/ToastContext';
import { LoadingState } from '../common/LoadingState';
import { Button } from '../common/Button';
import { TableAiInsights } from './TableAiInsights';
import api from '../../services/api';

export function TableDetails({ connectionId, schemaName, tableName }) {
  const { fetchTableInfo } = useSchema(connectionId);
  const { analyzeTable, loading: aiLoading } = useSchemaAI(connectionId);
  const toast = useToast();
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableAnalysis, setTableAnalysis] = useState(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (schemaName && tableName) {
      loadTableInfo();
      loadPreviewData(0);
      loadTotalCount();
    }
  }, [schemaName, tableName]);

  const loadTableInfo = async () => {
    setLoading(true);
    try {
      const info = await fetchTableInfo(schemaName, tableName);
      setTableInfo(info);
    } catch (err) {
      console.error('Failed to load table info:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviewData = async (offset) => {
    try {
      const response = await api.post(`/connections/${connectionId}/data/browse`, {
        schema_name: schemaName,
        table_name: tableName,
        limit: pageSize,
        offset,
      });
      if (response.data.success) {
        setPreviewData(response.data.rows);
      }
    } catch (err) {
      console.error('Failed to load preview data:', err);
    }
  };

  const loadTotalCount = async () => {
    try {
      const response = await api.get(`/connections/${connectionId}/data/count`, {
        params: { schema_name: schemaName, table_name: tableName }
      });
      setTotalCount(response.data.count);
    } catch (err) {
      console.error('Failed to load count:', err);
    }
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    loadPreviewData(newPage * pageSize);
  };

  const handlePrevPage = () => {
    const newPage = Math.max(0, page - 1);
    setPage(newPage);
    loadPreviewData(newPage * pageSize);
  };

  const handleAnalyzeTable = async (forceRefresh = false) => {
    try {
      setShowAiInsights(true);
      const result = await analyzeTable(schemaName, tableName, forceRefresh);
      setTableAnalysis(result);
      toast.success('Table analysis complete');
    } catch (err) {
      toast.error('Failed to analyze table');
    }
  };

  if (loading) return <LoadingState message="Loading table details..." />;
  if (!tableInfo) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {schemaName}.{tableName}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={<Sparkles size={16} />}
          onClick={() => handleAnalyzeTable()}
          disabled={aiLoading}
        >
          {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </div>

      {showAiInsights && (
        <TableAiInsights analysis={tableAnalysis} loading={aiLoading} />
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Columns size={20} className="text-green-600 dark:text-green-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Columns</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Nullable</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableInfo.columns?.map((col) => (
                <tr key={col.column_name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{col.column_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{col.data_type}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{col.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-sm">
                    {col.is_primary_key && <Key size={16} className="text-yellow-600 dark:text-yellow-400" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Preview</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextPage}
                disabled={(page + 1) * pageSize >= totalCount}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {tableInfo.columns?.map((col) => (
                    <th key={col.column_name} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      {col.column_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {cell !== null ? String(cell) : <span className="text-gray-400 italic">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
