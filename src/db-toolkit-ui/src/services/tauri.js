import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export const tauri = {
  getSystemMetrics: () => invoke('get_system_metrics'),
  getBackendPort: () => invoke('get_backend_port'),
  readFile: (filePath) => invoke('read_file', { filePath }),
  deleteFile: (filePath) => invoke('delete_file', { filePath }),
  renameFile: (oldPath, newName) => invoke('rename_file', { oldPath, newName }),
  openInEditor: (filePath) => invoke('open_in_editor', { filePath }),
  openFolder: (folderPath) => invoke('open_folder', { folderPath }),
  listMigrationFiles: (projectPath) => invoke('list_migration_files', { projectPath }),
  
  onMenuAction: (callback) => {
    return listen('menu-action', (event) => {
      callback(event.payload);
    });
  },
  
  sendThemeChange: (theme) => {
    // Theme changes handled in frontend only for Tauri
    console.log('Theme changed:', theme);
  },
  
  updateRecentConnections: (connections) => {
    // Recent connections handled in frontend only for Tauri
    console.log('Recent connections updated:', connections);
  },
  
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // Map old Electron IPC calls to Tauri commands
      const channelMap = {
        'get-system-metrics': 'get_system_metrics',
        'get-backend-port': 'get_backend_port',
        'read-file': 'read_file',
        'delete-file': 'delete_file',
        'rename-file': 'rename_file',
        'open-in-editor': 'open_in_editor',
        'open-folder': 'open_folder',
        'list-migration-files': 'list_migration_files',
      };
      
      const tauriCommand = channelMap[channel];
      if (tauriCommand) {
        const params = args[0] || {};
        return invoke(tauriCommand, params);
      }
      
      console.warn(`Unmapped IPC channel: ${channel}`);
      return Promise.reject(`Unmapped channel: ${channel}`);
    }
  }
};

// Expose globally for compatibility
window.electron = tauri;
