# Changelog

All notable changes to DB Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta] - 2024-12-09

### Added
- Migrated from Electron to Tauri for smaller bundle size and better performance
- Multi-database support (PostgreSQL, MySQL, SQLite, MongoDB)
- Connection management with save, test, and status indicators
- Visual schema explorer with tree browser
- Monaco-based query editor with syntax highlighting and auto-complete
- Multiple query tabs with auto-save
- Query history tracking
- Inline data editing with insert/delete capabilities
- CSV/JSON export and import
- Automated backup system with scheduling
- Real-time system metrics (RAM, CPU, Load, Disk)
- Dark mode with OS theme detection
- Native menu system for macOS, Windows, Linux
- Auto-updater with GitHub releases integration
- Backend process management with automatic cleanup
- Exponential backoff for backend connection
- AI-powered query assistance (with Cloudflare credentials)

### Changed
- Replaced Electron with Tauri (Rust + WebView)
- Backend communication via HTTP instead of IPC
- Reduced bundle size from ~100MB to ~30MB
- Improved startup performance

### Fixed
- Backend process cleanup on app quit
- Theme toggle not working on second click
- .env file loading in PyInstaller bundle
- Backend port detection with retry logic
- System metrics calculation for macOS

### Technical
- Frontend: React 18, Tailwind CSS, Monaco Editor, Vite
- Backend: Python FastAPI, SQLAlchemy, PyInstaller
- Desktop: Tauri 2.x, Rust
- Platforms: macOS (Intel), Windows, Linux (deb/rpm)
