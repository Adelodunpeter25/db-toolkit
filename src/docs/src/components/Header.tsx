import { Database, Home, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';

export default function Header() {
  return (
    <motion.header 
      className="header"
      {...fadeIn}
    >
      <div className="header-content">
        <div className="logo">
          <Database size={32} />
          <span className="title">DB Toolkit Docs</span>
        </div>
        <div className="header-links">
          <a href="https://db-toolkit.vercel.app" target="_blank" rel="noopener noreferrer">
            <Home size={18} />
            <span>Home</span>
          </a>
          <a href="https://github.com/Adelodunpeter25/db-toolkit" target="_blank" rel="noopener noreferrer">
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
