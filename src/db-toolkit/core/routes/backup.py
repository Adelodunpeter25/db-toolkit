"""Backup management routes."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
from core.storage import ConnectionStorage
from core.backup_storage import BackupStorage
from core.schemas.backup import BackupCreateRequest, BackupRestoreRequest
from operations.backup_manager import BackupManager

router = APIRouter()
storage = ConnectionStorage()
backup_storage = BackupStorage()
backup_manager = BackupManager()


@router.get("/backups")
async def get_backups(connection_id: Optional[str] = None):
    """Get all backups, optionally filtered by connection."""
    backups = await backup_storage.get_all_backups(connection_id)
    return {"success": True, "backups": [b.model_dump() for b in backups]}


@router.get("/backups/{backup_id}")
async def get_backup(backup_id: str):
    """Get backup by ID."""
    backup = await backup_storage.get_backup(backup_id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    return {"success": True, "backup": backup.model_dump()}


@router.post("/backups")
async def create_backup(request: BackupCreateRequest):
    """Create new backup."""
    connection = await storage.get_connection(request.connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        backup = await backup_manager.create_backup(
            connection=connection,
            name=request.name,
            backup_type=request.backup_type,
            tables=request.tables,
            compress=request.compress,
        )
        return {"success": True, "backup": backup.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/backups/{backup_id}/restore")
async def restore_backup(backup_id: str, request: BackupRestoreRequest):
    """Restore backup to database."""
    backup = await backup_storage.get_backup(backup_id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    target_conn_id = request.target_connection_id or backup.connection_id
    target_connection = await storage.get_connection(target_conn_id)
    if not target_connection:
        raise HTTPException(status_code=404, detail="Target connection not found")
    
    try:
        await backup_manager.restore_backup(
            backup=backup,
            target_connection=target_connection,
            tables=request.tables,
        )
        return {"success": True, "message": "Backup restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/backups/{backup_id}/download")
async def download_backup(backup_id: str):
    """Download backup file."""
    backup = await backup_storage.get_backup(backup_id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    from pathlib import Path
    if not Path(backup.file_path).exists():
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    return FileResponse(
        path=backup.file_path,
        filename=Path(backup.file_path).name,
        media_type="application/octet-stream",
    )


@router.delete("/backups/{backup_id}")
async def delete_backup(backup_id: str):
    """Delete backup."""
    success = await backup_manager.delete_backup(backup_id)
    if not success:
        raise HTTPException(status_code=404, detail="Backup not found")
    return {"success": True, "message": "Backup deleted"}
