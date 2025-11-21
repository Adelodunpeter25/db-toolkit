# Backend Bundling Guide

## Overview
The FastAPI backend is bundled with the Electron app using PyInstaller. The backend runs on a dynamically allocated port to avoid conflicts with other services.

## Architecture

### Dynamic Port Allocation
- Backend finds an available port starting from 8000
- Port is written to `~/.db-toolkit/backend.port`
- Port is printed to stdout as `BACKEND_PORT:<port>`
- Electron reads the port and configures frontend API calls

### Process Management
- Electron spawns backend process on startup
- Backend runs as child process of Electron
- Backend is terminated when Electron quits
- Health checks ensure backend is ready before loading UI

## Building the Backend

### Prerequisites
```bash
cd src/db-toolkit
uv pip install pyinstaller
```

### Build Backend Executable
```bash
cd src/db-toolkit
./build-backend.sh
```

This creates: `dist/db-toolkit-backend` (or `.exe` on Windows)

### Platform-Specific Builds
- **macOS**: `db-toolkit-backend` (Mach-O executable)
- **Windows**: `db-toolkit-backend.exe`
- **Linux**: `db-toolkit-backend` (ELF executable)

## Building the Full App

### Build Everything
```bash
cd src/db-toolkit-ui
npm run package
```

This will:
1. Build backend with PyInstaller
2. Build React frontend with Vite
3. Package everything with electron-builder
4. Output to `release/` directory

### Platform-Specific Packages
```bash
npm run package:mac    # macOS DMG
npm run package:win    # Windows installer
npm run package:linux  # Linux AppImage/DEB
```

## Development Mode

### Run Backend Separately
```bash
cd src/db-toolkit
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Run Frontend
```bash
cd src/db-toolkit-ui
npm run electron-dev
```

In development, Electron uses `http://localhost:8000` by default.

## File Structure

```
src/
├── db-toolkit/
│   ├── server.py              # Entry point with port allocation
│   ├── backend.spec           # PyInstaller configuration
│   ├── build-backend.sh       # Build script
│   └── dist/
│       └── db-toolkit-backend # Compiled executable
└── db-toolkit-ui/
    ├── electron/
    │   ├── main.js            # Spawns backend process
    │   └── backend-manager.js # Backend lifecycle management
    └── release/               # Final packaged apps
```

## Backend Manager

The `backend-manager.js` handles:
- Finding backend executable path
- Spawning backend process
- Reading dynamic port from stdout
- Health checking backend
- Terminating backend on quit

## API Configuration

Frontend automatically detects backend URL:
- **Development**: `http://localhost:8000`
- **Production**: `http://127.0.0.1:<dynamic-port>`

## WebSocket Configuration

WebSocket endpoints use the same dynamic port:
- `ws://127.0.0.1:<port>/ws/backups`
- `ws://127.0.0.1:<port>/ws/terminal`
- `ws://127.0.0.1:<port>/ws/migrator`
- `ws://127.0.0.1:<port>/ws/analytics`

## Troubleshooting

### Backend Fails to Start
- Check logs in `~/.db-toolkit/logs/`
- Verify backend executable exists in `resources/backend/`
- Check if ports 8000-8100 are available

### Port Conflicts
- Backend automatically finds free port
- If all ports busy, shows error dialog
- User can restart app to retry

### Build Errors
- Ensure PyInstaller is installed: `uv pip install pyinstaller`
- Check Python dependencies in `pyproject.toml`
- Verify all hidden imports in `backend.spec`

## Security Notes

- Backend only listens on `127.0.0.1` (localhost)
- No external network access
- Port file stored in user home directory
- Backend process tied to Electron lifecycle

## Performance

- Backend startup: ~2-5 seconds
- Bundle size increase: ~80-100MB
- Memory overhead: ~50-100MB
- No Python installation required on user machine

## Future Improvements

- [ ] Add backend update mechanism
- [ ] Implement backend crash recovery
- [ ] Add backend performance monitoring
- [ ] Support multiple backend instances
- [ ] Add backend logging to UI
