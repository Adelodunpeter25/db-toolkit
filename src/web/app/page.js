import Hero from '@/components/Hero';
import { Database, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

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
