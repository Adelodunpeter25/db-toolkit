/**
 * SQL Documentation and Reference page.
 */
import { useState, useMemo } from 'react';
import { Search, Copy, Check, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDebounce } from '../utils/debounce';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/common/Button';
import { pageTransition } from '../utils/animations';
import documentation from '../data/documentation.json';

function DocumentationPage() {
  const { showToast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredDocs = useMemo(() => {
    if (!debouncedSearch) return documentation.categories;

    const query = debouncedSearch.toLowerCase();
    return documentation.categories
      .map(category => ({
        ...category,
        topics: category.topics.filter(topic =>
          topic.title.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query) ||
          topic.keywords.some(kw => kw.includes(query))
        )
      }))
      .filter(category => category.topics.length > 0);
  }, [debouncedSearch]);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    showToast('Code copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderContent = (content) => {
    const parts = content.split('```');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        const [lang, ...codeLines] = part.split('\n');
        const code = codeLines.join('\n').trim();
        const codeId = `code-${idx}`;
        return (
          <div key={idx} className="relative my-4 group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(code, codeId)}
              >
                {copiedCode === codeId ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <div key={idx} className="prose dark:prose-invert max-w-none">
          {part.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="font-semibold mt-4 mb-2">{line.slice(2, -2)}</p>;
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4">{line.slice(2)}</li>;
            }
            if (line.trim()) {
              return <p key={i} className="mb-2">{line}</p>;
            }
            return null;
          })}
        </div>
      );
    });
  };

  return (
    <motion.div className="h-screen flex" {...pageTransition}>
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SQL Reference</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <nav className="p-2">
          {filteredDocs.map(category => (
            <div key={category.id} className="mb-4">
              <h3 className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {category.title}
              </h3>
              {category.topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedTopic?.id === topic.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTopic ? (
          <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedTopic.title}
            </h1>
            <div className="text-gray-700 dark:text-gray-300">
              {renderContent(selectedTopic.content)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                SQL Documentation
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select a topic from the sidebar to view documentation
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DocumentationPage;
