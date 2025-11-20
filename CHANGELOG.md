# Changelog

All notable changes to DB Toolkit will be documented in this file. Only the last two version changes are documented here. For complete changelog, visit [Documentation](https://docs-dbtoolkit.vercel.app).

## [0.5.0] - 2025-01-22

### Added
- **DBAssist AI Integration**
  - Natural language to SQL conversion with Google Gemini API
  - Query optimization suggestions and error fixing
  - Schema analysis and table insights
  - AI Assistant panel in Query Editor (right sidebar)
  - Schema Explorer AI insights for table analysis
- **Database Analytics Dashboard**
  - Real-time monitoring with WebSocket updates (5s interval)
  - Query monitoring: active, long-running (>30s), blocked queries
  - Query execution plan visualization and type classification
  - System metrics: CPU, memory, disk, connections, database size
  - Historical data storage (3 hours) with time range selector
  - Slow query log with 24h retention
  - PDF export for analytics reports
  - Kill query functionality for problematic queries
- **Enhanced Connection Management**
  - Database URL connection option with async protocol support
  - Support for postgresql+asyncpg, mysql+aiomysql, mongodb+srv, sqlite:///
  - Connection reuse optimization (5-10x faster queries)
- **Performance Optimizations**
  - Query result caching and schema cache optimization (3-5x faster repeated queries)
  - Adaptive background task scheduling (50-70% CPU reduction)
  - Frontend React.memo, virtualized lists, request deduplication (50% render reduction)
  - Route-based code splitting with lazy loading (40-60% faster initial load)
- **Documentation Updates**
  - Comprehensive feature documentation for all major components
  - DBAssist AI usage guide
  - Analytics dashboard documentation
  - Connection management guide

### Fixed
- Operation lock conflicts with timeouts and expiration (prevents "operation in progress" errors)
- Database URL parsing for async protocols and SQLite format
- Charts dark/light mode compatibility
- Connection management performance issues
- Frontend performance bottlenecks

## [0.4.1] Bug Fixes - 2025-01-21

### Fixed
- White screen flash on backups page loading
- Overview tab not auto-selected on app startup in production
- HashRouter implementation for proper Electron routing
- Navigation issues in packaged application

## [0.4.0] - 2025-01-20

### Added
- **Terminal Enhancements**
  - Multiple terminal tabs with + button
  - Session persistence (restores tabs, height, active tab, working directory)
  - Auto-reconnection with exponential backoff (1s to 30s)
  - Database CLI shortcuts (psql, mysql, mongo buttons)
  - Resizable terminal panel
- **Migration File Browser**
  - View migration files
  - Open files in system editor
  - Edit migraton files
  - Open migrations folder button
  - Drag divider to resize sidebar (250px-600px)
- **Migration UX Improvements**
  - Clear output button
  - Split layout with file browser
  - Better project management

### Improved
- Terminal starts in home directory by default
- Terminal properly restores last working directory on reconnect
- Migration documentation updated with new features
- Terminal documentation simplified and focused
