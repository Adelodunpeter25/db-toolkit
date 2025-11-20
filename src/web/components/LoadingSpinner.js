export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
}
