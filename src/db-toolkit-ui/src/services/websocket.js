const WS_BASE_URL = 'ws://localhost:8001/ws';

export const WS_ENDPOINTS = {
  BACKUPS: `${WS_BASE_URL}/backups`,
  TERMINAL: `${WS_BASE_URL}/terminal`,
  MIGRATOR: `${WS_BASE_URL}/migrator`,
  ANALYTICS: `${WS_BASE_URL}/analytics`,
};
