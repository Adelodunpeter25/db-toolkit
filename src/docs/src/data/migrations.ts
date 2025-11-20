export const migrationsData = {
  title: "Database Migrations",
  sections: [
    {
      heading: "Overview",
      content: `DB Toolkit integrates Migrator CLI - a universal migration tool for Python apps using SQLAlchemy.

Features:
- Zero boilerplate - one command to init and start migrating
- Auto-detect models - finds SQLAlchemy Base classes automatically
- Smart config - no need to manually edit alembic.ini or env.py
- Framework agnostic - works with FastAPI, Flask, or standalone SQLAlchemy
- Pythonic CLI - clean, readable, extensible commands`
    },
    {
      heading: "Installation",
      content: `Install Migrator CLI:

**Quick install:**
curl -sSL https://raw.githubusercontent.com/Adelodunpeter25/migrator/main/install.sh | bash

**Using pip:**
pip install migrator-cli

**Using uv:**
uv add migrator-cli`
    },
    {
      heading: "Quick Start",
      content: `**1. Set up your database URL**

Create a .env file:
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

Or use settings.py, config.py, config.yaml, or config.toml

**2. Initialize migrations**
migrator init

**3. Create your first migration**
migrator makemigrations "create user table"

**4. Apply migrations**
migrator migrate`
    },
    {
      heading: "Commands",
      content: `**Initialize migration environment:**
migrator init

**Create new migration:**
migrator makemigrations "add email to users"

**Apply migrations:**
migrator migrate

**Rollback migrations:**
migrator downgrade

**Show migration history:**
migrator history

**Show current revision:**
migrator current

**Mark database as migrated (for existing databases):**
migrator stamp head

**Show migration status:**
migrator status`
    },
    {
      heading: "Advanced Usage",
      content: `**Nested Project Structures:**
migrator init --base app.core.database:Base
migrator makemigrations "initial" --base app.core.database:Base

**Async SQLAlchemy:**
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
Migrator auto-converts to: postgresql://user:pass@localhost/db

**Custom Config:**
migrator init --config backend/settings.py

**Verbose Mode:**
migrator init --verbose`
    },
    {
      heading: "Using in DB Toolkit",
      content: `DB Toolkit provides a Migration Panel with:
- Execute migration commands with real-time WebSocket output
- Manage migration projects with folder selection
- Link migrations to database connections
- View migration history and status
- Terminal output for all migration operations

Access via the "Migrations" tab in the sidebar.`
    },
    {
      heading: "Troubleshooting",
      content: `**Base not found?**
Use --base flag:
migrator init --base app.core.database:Base

**Existing database?**
Use stamp to mark current state:
migrator stamp head

**Connection issues?**
Verify DATABASE_URL in .env file
Check database is running and accessible`
    }
  ]
};
