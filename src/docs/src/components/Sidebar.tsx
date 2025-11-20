import { BookOpen, Database, Code, FolderTree, Table, Shield, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/motion';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
  { id: 'connections', label: 'Connections', icon: Database },
  { id: 'query-editor', label: 'Query Editor', icon: Code },
  { id: 'schema-explorer', label: 'Schema Explorer', icon: FolderTree },
  { id: 'data-explorer', label: 'Data Explorer', icon: Table },
  { id: 'backup-restore', label: 'Backup & Restore', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>DB Toolkit</h2>
        <span className="version">v0.3.0</span>
      </div>
      <motion.nav 
        className="sidebar-nav"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
              variants={fadeInUp}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={18} />
              <span>{section.label}</span>
            </motion.button>
          );
        })}
      </motion.nav>
    </aside>
  );
}
