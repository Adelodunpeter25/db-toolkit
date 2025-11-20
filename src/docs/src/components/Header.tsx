import { Database, Home, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';

export default function Header() {
  return (
    <motion.header 
      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 shadow-lg"
      {...fadeIn}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Database size={32} />
          <span className="text-2xl font-bold">DB Toolkit Docs</span>
        </div>
        <div className="flex gap-6">
          <a href="https://db-toolkit.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity font-medium">
            <Home size={18} />
            <span>Home</span>
          </a>
          <a href="https://github.com/Adelodunpeter25/db-toolkit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity font-medium">
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
