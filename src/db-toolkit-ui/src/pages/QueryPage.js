import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useQuery } from '../hooks';
import { QueryEditor } from '../components/query/QueryEditor';
import { ResultsTable } from '../components/query/ResultsTable';

function QueryPage() {
  const { connectionId } = useParams();
  const [query, setQuery] = useState('');
  const { result, loading, error, executeQuery } = useQuery(connectionId);

  const handleExecute = async () => {
    if (!query.trim()) return;
    try {
      await executeQuery(query);
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Query Editor</h2>

      <QueryEditor
        query={query}
        onChange={setQuery}
        onExecute={handleExecute}
        loading={loading}
      />

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <ResultsTable result={result} />
    </div>
  );
}

export default QueryPage;
