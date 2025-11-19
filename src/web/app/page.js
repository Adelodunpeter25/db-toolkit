import { Database, Download, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-6">
          <Database className="w-20 h-20 text-blue-600" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          DB Toolkit
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Modern, cross-platform desktop database management application built with Electron, React, and Python FastAPI
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://github.com/Adelodunpeter25/db-toolkit/releases/latest"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Download for macOS
          </a>
          <a
            href="https://github.com/Adelodunpeter25/db-toolkit"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
            <p className="text-gray-600">
              Lightning-fast query execution with Monaco editor and intelligent autocomplete
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Database className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Database</h3>
            <p className="text-gray-600">
              Support for PostgreSQL, MySQL, SQLite, and MongoDB all in one place
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">
              Encrypted credentials and secure connection management built-in
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2025 DB Toolkit. Built with ❤️ using Python, React, and Electron</p>
        </div>
      </footer>
    </main>
  );
}
