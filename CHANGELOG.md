# Changelog

All notable changes to DB Toolkit will be documented in this file. Only the last two version changes are documented here. For complete changelog, visit [Documentation](https://docs-dbtoolkit.vercel.app).

## [0.5.1] - 2025-01-23

### Added
- Schema Explorer AI with schema-level and table-level analysis
- Per-tab AI chat history in Query Editor (10 message limit)
- IndexedDB caching system for AI analysis results (24-hour expiration)
- Password visibility toggle in connection modal
- Connection active status indicator (green dot for last 10 minutes)
- Terminal maximize/minimize functionality
- Terminal light/dark mode support

### Fixed
- Terminal height resizing and content display issues
- Terminal WebSocket disconnect errors
- Infinite re-render in useConnections hook
- Query page auto-reconnect on load
- CSV export with custom delimiters and headers

### Changed
- Migrated query tabs, schema cache, and table info from localStorage to IndexedDB
- Removed query explain analyzer (replaced by AI Assistant)

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
