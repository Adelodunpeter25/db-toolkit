# Development Changes

This file tracks changes during development before they are added to CHANGELOG.md.

## Unreleased

### Added
- Database URL connection option - Add checkbox to use full database URL instead of individual fields in connection modal
  - Support for async protocols: postgresql+asyncpg, mysql+aiomysql, mongodb+srv
  - Support for SQLite file paths: sqlite:///path/to/db.sqlite
  - URL validation with specific error messages
- Database Analytics page - Real-time monitoring dashboard
  - Current queries with kill query functionality
  - Long-running queries detection (>30 seconds)
  - Blocked queries/locks monitoring
  - Database size tracking
  - Active/idle connections count
  - System metrics: CPU, memory, disk usage
  - Real-time charts with auto-refresh (5 seconds)
  - Support for PostgreSQL, MySQL, MongoDB, SQLite

### Changed

### Fixed
- Database URL parsing now handles async driver protocols correctly
- SQLite URL format (sqlite:///) now parsed correctly
- URL field clears when toggling checkbox off
- Parsed URL values auto-populate fields for immediate editing
- Visual feedback (toast) when URL is parsed successfully
- Create Connection button in Data Explorer now navigates correctly without page refresh

### Removed
