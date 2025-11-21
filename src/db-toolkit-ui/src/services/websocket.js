let WS_BASE_URL = 'ws://localhost:8000/ws';

// Get backend URL from Electron and update WebSocket base URL
if (window.electron?.getBackendUrl) {
  window.electron.getBackendUrl().then(url => {
    WS_BASE_URL = url.replace('http://', 'ws://') + '/ws';
    // Update endpoints
    WS_ENDPOINTS.BACKUPS = `${WS_BASE_URL}/backups`;
    WS_ENDPOINTS.TERMINAL = `${WS_BASE_URL}/terminal`;
    WS_ENDPOINTS.MIGRATOR = `${WS_BASE_URL}/migrator`;
    WS_ENDPOINTS.ANALYTICS = `${WS_BASE_URL}/analytics`;
    console.log('WebSocket URL configured:', WS_BASE_URL);
  }).catch(err => {
    console.error('Failed to get backend URL for WebSocket:', err);
  });
}

export const WS_ENDPOINTS = {
  BACKUPS: `${WS_BASE_URL}/backups`,
  TERMINAL: `${WS_BASE_URL}/terminal`,
  MIGRATOR: `${WS_BASE_URL}/migrator`,
  ANALYTICS: `${WS_BASE_URL}/analytics`,
};
