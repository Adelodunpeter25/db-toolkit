# Development Changes

This file tracks changes during development before they are added to CHANGELOG.md.

## Unreleased

### Added
- AI Assistant resizable sidebar with drag-to-resize functionality
- Terminal light mode support with theme-aware styling
- Terminal auto-scroll to bottom on new output
- Database CLI shortcuts (psql/mysql/mongo) auto-fill connection parameters from last connection

### Fixed
- AI explanation and optimization results now display correctly in sidebar
- CSV export now fully functional with custom delimiter and header options
- Query page scrolling isolated to individual sections (Results, Messages, History tabs)
- Auto-reconnect on QueryPage load prevents "Connection not found" errors after page refresh
- CSV export now correctly reads data from query results (handles both rows and data keys)
- Loading spinners added to Dashboard and Analytics pages to prevent empty state flash
- Terminal height now resizes properly when dragging split panel divider
- Terminal theme now correctly toggles between light and dark modes

### Removed
- Broken terminal session persistence code that did nothing