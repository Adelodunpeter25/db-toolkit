import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DocContent from '../components/DocContent';
import {
  gettingStartedData,
  connectionsData,
  queryEditorData,
  schemaExplorerData,
  dataExplorerData,
  backupRestoreData,
  settingsData,
} from '../data';

const docMap: Record<string, any> = {
  'getting-started': gettingStartedData,
  'connections': connectionsData,
  'query-editor': queryEditorData,
  'schema-explorer': schemaExplorerData,
  'data-explorer': dataExplorerData,
  'backup-restore': backupRestoreData,
  'settings': settingsData,
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="flex max-w-7xl mx-auto w-full">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <DocContent data={docMap[activeSection]} />
    </div>
  );
}
