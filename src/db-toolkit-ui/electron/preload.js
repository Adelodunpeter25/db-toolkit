const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics')
});
