# Development Changes

This file tracks changes during development before they are added to CHANGELOG.md.

## Unreleased

### Added
- Database URL connection option with async protocol support (postgresql+asyncpg, mysql+aiomysql, mongodb+srv, sqlite:///)
- Database Analytics page with real-time monitoring (WebSocket, 5s updates)
  - Query monitoring: current, long-running (>30s), blocked queries with kill functionality
  - Query execution plan visualization and type classification (SELECT/INSERT/UPDATE/DELETE)
  - System metrics: CPU, memory, disk, connections, database size
  - Interactive charts (Recharts) with tooltips, zoom, dark/light mode
  - Historical data storage (3 hours) with time range selector (1h/2h/3h)
- Documentation for Connections, Data Explorer, Analytics, and Backups features

### Changed
- Split analytics into database-specific modules (postgresql, mysql, mongodb, sqlite)
- Enhanced MySQL: query type classification, improved lock detection with user info
- Enhanced MongoDB: operation type classification, lock wait detection
- Enhanced SQLite: table/index counts, page statistics, largest tables info

### Fixed
- Database URL parsing for async protocols and SQLite format
- URL field auto-clears on checkbox toggle, auto-populates fields for editing
- Create Connection button navigation without page refresh
- JSX parent element error in AnalyticsPage
- Charts dark/light mode compatibility

### Database Support
- PostgreSQL: Full analytics support
- MySQL: Enhanced analytics with query types and locks
- MongoDB: Enhanced analytics with operations and lock waits
- SQLite: Enhanced analytics with table/page statistics

### Removed
