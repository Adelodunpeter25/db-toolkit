import { memo } from 'react';
import { Home, BookOpen, Menu } from 'lucide-react';

interface BottomBarProps {
  onHomeClick: () => void;
  onDocsClick: () => void;
  onMenuClick: () => void;
}

function BottomBar({ onHomeClick, onDocsClick, onMenuClick }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={onHomeClick}
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Home size={20} />
          <span className="text-xs">Home</span>
        </button>
        
        <button
          onClick={onDocsClick}
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <BookOpen size={20} />
          <span className="text-xs">Docs</span>
        </button>
        
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Menu size={20} />
          <span className="text-xs">Menu</span>
        </button>
      </div>
    </div>
  );
}

export default memo(BottomBar);
