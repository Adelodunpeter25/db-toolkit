"""Database backup and restore operations."""

import asyncio
import gzip
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from core.models import DatabaseConnection, BackupType, BackupStatus, Backup
from core.backup_storage import BackupStorage


class BackupManager:
    """Manages database backups and restores."""

    def __init__(self):
        self.storage = BackupStorage()
        self.backup_dir = Path.home() / ".db-toolkit" / "backups" / "files"
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    async def create_backup(
        self,
        connection: DatabaseConnection,
        name: str,
        backup_type: BackupType,
        tables: Optional[List[str]] = None,
        compress: bool = True,
    ) -> Backup:
        """Create database backup."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{connection.name}_{timestamp}.sql"
        if compress:
            filename += ".gz"
        
        file_path = str(self.backup_dir / filename)
        
        backup = await self.storage.add_backup(
            connection_id=connection.id,
            name=name,
            backup_type=backup_type,
            file_path=file_path,
            tables=tables,
            compressed=compress,
        )
        
        asyncio.create_task(self._execute_backup(backup, connection, tables, compress))
        return backup

    async def _execute_backup(
        self,
        backup: Backup,
        connection: DatabaseConnection,
        tables: Optional[List[str]],
        compress: bool,
    ):
        """Execute backup in background."""
        try:
            await self.storage.update_backup(backup.id, status=BackupStatus.IN_PROGRESS)
            
            if connection.db_type.value == "postgresql":
                await self._backup_postgresql(backup, connection, tables)
            elif connection.db_type.value == "mysql":
                await self._backup_mysql(backup, connection, tables)
            elif connection.db_type.value == "sqlite":
                await self._backup_sqlite(backup, connection)
            else:
                raise ValueError(f"Backup not supported for {connection.db_type}")
            
            if compress and not backup.file_path.endswith(".gz"):
                await self._compress_file(backup.file_path)
            
            file_size = Path(backup.file_path).stat().st_size
            await self.storage.update_backup(
                backup.id,
                status=BackupStatus.COMPLETED,
                completed_at=datetime.now().isoformat(),
                file_size=file_size,
            )
        except Exception as e:
            await self.storage.update_backup(
                backup.id,
                status=BackupStatus.FAILED,
                error_message=str(e),
            )

    async def _backup_postgresql(
        self,
        backup: Backup,
        connection: DatabaseConnection,
        tables: Optional[List[str]],
    ):
        """Backup PostgreSQL database."""
        cmd = [
            "pg_dump",
            "-h", connection.host,
            "-p", str(connection.port or 5432),
            "-U", connection.username,
            "-d", connection.database,
            "-F", "p",
        ]
        
        if backup.backup_type == BackupType.SCHEMA_ONLY:
            cmd.append("--schema-only")
        elif backup.backup_type == BackupType.DATA_ONLY:
            cmd.append("--data-only")
        elif backup.backup_type == BackupType.TABLES and tables:
            for table in tables:
                cmd.extend(["-t", table])
        
        output_file = backup.file_path.replace(".gz", "") if backup.compressed else backup.file_path
        cmd.extend(["-f", output_file])
        
        env = {"PGPASSWORD": connection.password} if connection.password else {}
        process = await asyncio.create_subprocess_exec(
            *cmd,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"pg_dump failed: {stderr.decode()}")

    async def _backup_mysql(
        self,
        backup: Backup,
        connection: DatabaseConnection,
        tables: Optional[List[str]],
    ):
        """Backup MySQL database."""
        cmd = [
            "mysqldump",
            "-h", connection.host,
            "-P", str(connection.port or 3306),
            "-u", connection.username,
        ]
        
        if connection.password:
            cmd.append(f"-p{connection.password}")
        
        if backup.backup_type == BackupType.SCHEMA_ONLY:
            cmd.append("--no-data")
        elif backup.backup_type == BackupType.DATA_ONLY:
            cmd.append("--no-create-info")
        
        cmd.append(connection.database)
        
        if backup.backup_type == BackupType.TABLES and tables:
            cmd.extend(tables)
        
        output_file = backup.file_path.replace(".gz", "") if backup.compressed else backup.file_path
        
        with open(output_file, "w") as f:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=f,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"mysqldump failed: {stderr.decode()}")

    async def _backup_sqlite(self, backup: Backup, connection: DatabaseConnection):
        """Backup SQLite database."""
        output_file = backup.file_path.replace(".gz", "") if backup.compressed else backup.file_path
        await asyncio.to_thread(shutil.copy2, connection.database, output_file)

    async def _compress_file(self, file_path: str):
        """Compress backup file with gzip."""
        def compress():
            with open(file_path, "rb") as f_in:
                with gzip.open(f"{file_path}.gz", "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)
            Path(file_path).unlink()
        
        await asyncio.to_thread(compress)

    async def restore_backup(
        self,
        backup: Backup,
        target_connection: DatabaseConnection,
        tables: Optional[List[str]] = None,
    ):
        """Restore database from backup."""
        file_path = backup.file_path
        
        if backup.compressed:
            temp_file = file_path.replace(".gz", "")
            await self._decompress_file(file_path, temp_file)
            file_path = temp_file
        
        try:
            if target_connection.db_type.value == "postgresql":
                await self._restore_postgresql(file_path, target_connection)
            elif target_connection.db_type.value == "mysql":
                await self._restore_mysql(file_path, target_connection)
            elif target_connection.db_type.value == "sqlite":
                await self._restore_sqlite(file_path, target_connection)
        finally:
            if backup.compressed and Path(file_path).exists():
                Path(file_path).unlink()

    async def _decompress_file(self, compressed_path: str, output_path: str):
        """Decompress gzip file."""
        def decompress():
            with gzip.open(compressed_path, "rb") as f_in:
                with open(output_path, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)
        
        await asyncio.to_thread(decompress)

    async def _restore_postgresql(self, file_path: str, connection: DatabaseConnection):
        """Restore PostgreSQL database."""
        cmd = [
            "psql",
            "-h", connection.host,
            "-p", str(connection.port or 5432),
            "-U", connection.username,
            "-d", connection.database,
            "-f", file_path,
        ]
        
        env = {"PGPASSWORD": connection.password} if connection.password else {}
        process = await asyncio.create_subprocess_exec(
            *cmd,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"psql restore failed: {stderr.decode()}")

    async def _restore_mysql(self, file_path: str, connection: DatabaseConnection):
        """Restore MySQL database."""
        cmd = [
            "mysql",
            "-h", connection.host,
            "-P", str(connection.port or 3306),
            "-u", connection.username,
        ]
        
        if connection.password:
            cmd.append(f"-p{connection.password}")
        
        cmd.append(connection.database)
        
        with open(file_path, "r") as f:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=f,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"mysql restore failed: {stderr.decode()}")

    async def _restore_sqlite(self, file_path: str, connection: DatabaseConnection):
        """Restore SQLite database."""
        await asyncio.to_thread(shutil.copy2, file_path, connection.database)

    async def delete_backup(self, backup_id: str) -> bool:
        """Delete backup file and metadata."""
        backup = await self.storage.get_backup(backup_id)
        if not backup:
            return False
        
        if Path(backup.file_path).exists():
            Path(backup.file_path).unlink()
        
        return await self.storage.delete_backup(backup_id)
