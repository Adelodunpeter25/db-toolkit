import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
            Page Not Found
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Home size={20} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            <Search size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
