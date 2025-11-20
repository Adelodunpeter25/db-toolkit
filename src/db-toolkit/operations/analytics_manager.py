"""Database analytics and monitoring operations."""

import psutil
from typing import Dict, List, Any
from datetime import datetime, timedelta
from collections import defaultdict
from core.models import DatabaseConnection
from operations.analytics import (
    get_postgresql_analytics,
    get_mysql_analytics,
    get_mongodb_analytics,
    get_sqlite_analytics
)

# Store historical metrics (in-memory, last 3 hours)
historical_metrics = defaultdict(list)


class AnalyticsManager:
    """Manage database analytics and monitoring."""

    def __init__(self, connection):
        """Initialize analytics manager."""
        self.connection = connection

    async def get_analytics(self, config: DatabaseConnection, connection_id: int) -> Dict[str, Any]:
        """Get comprehensive database analytics."""
        db_type = config.db_type.value if hasattr(config.db_type, 'value') else config.db_type
        
        if db_type == 'postgresql':
            result = await get_postgresql_analytics(self.connection)
        elif db_type == 'mysql':
            result = await get_mysql_analytics(self.connection)
        elif db_type == 'mongodb':
            result = await get_mongodb_analytics(self.connection)
        elif db_type == 'sqlite':
            db_path = getattr(config, 'file_path', None) or getattr(config, 'database', None)
            result = await get_sqlite_analytics(self.connection, db_path)
        else:
            return {"error": "Unsupported database type"}
        
        # Add system stats
        if result.get('success'):
            result['system_stats'] = self._get_system_stats()
            self._store_historical_data(connection_id, result)
        
        return result
    
    def _store_historical_data(self, connection_id: int, data: Dict[str, Any]):
        """Store metrics for historical analysis (last 3 hours)."""
        key = f"conn_{connection_id}"
        timestamp = datetime.utcnow()
        
        historical_metrics[key].append({
            'timestamp': timestamp.isoformat(),
            'cpu': data['system_stats']['cpu_usage'],
            'memory': data['system_stats']['memory_usage'],
            'disk': data['system_stats']['disk_usage'],
            'connections': data['active_connections'],
            'idle_connections': data['idle_connections'],
            'database_size': data['database_size']
        })
        
        # Keep only last 3 hours (3600 data points at 3s intervals)
        cutoff = timestamp - timedelta(hours=3)
        historical_metrics[key] = [
            m for m in historical_metrics[key]
            if datetime.fromisoformat(m['timestamp']) > cutoff
        ]
    
    def get_historical_data(self, connection_id: int, hours: int = 3) -> List[Dict[str, Any]]:
        """Get historical metrics for specified time range."""
        key = f"conn_{connection_id}"
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        return [
            m for m in historical_metrics.get(key, [])
            if datetime.fromisoformat(m['timestamp']) > cutoff
        ]



    def _get_system_stats(self) -> Dict[str, Any]:
        """Get system-level statistics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')

            return {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_total": memory.total,
                "memory_used": memory.used,
                "disk_usage": disk.percent,
                "disk_total": disk.total,
                "disk_used": disk.used
            }
        except Exception as e:
            return {
                "cpu_usage": 0,
                "memory_usage": 0,
                "memory_total": 0,
                "memory_used": 0,
                "disk_usage": 0,
                "disk_total": 0,
                "disk_used": 0,
                "error": str(e)
            }

    async def get_query_plan(self, query: str, config: DatabaseConnection) -> Dict[str, Any]:
        """Get query execution plan."""
        db_type = config.db_type.value if hasattr(config.db_type, 'value') else config.db_type
        
        try:
            if db_type == 'postgresql':
                result = await self.connection.fetch(f"EXPLAIN (FORMAT JSON, ANALYZE) {query}")
                plan = result[0]['QUERY PLAN'] if result else {}
                return {"success": True, "plan": plan}
            elif db_type == 'mysql':
                result = await self.connection.fetch(f"EXPLAIN FORMAT=JSON {query}")
                plan = result[0]['EXPLAIN'] if result else {}
                return {"success": True, "plan": plan}
            else:
                return {"success": False, "error": "Query plan not supported for this database"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def kill_query(self, pid: int, config: DatabaseConnection) -> Dict[str, Any]:
        """Kill a running query by PID."""
        db_type = config.db_type.value if hasattr(config.db_type, 'value') else config.db_type
        
        try:
            if db_type == 'postgresql':
                await self.connection.execute(f"SELECT pg_terminate_backend({pid})")
            elif db_type == 'mysql':
                await self.connection.execute(f"KILL {pid}")
            elif db_type == 'mongodb':
                await self.connection.admin.command('killOp', op=pid)
            else:
                return {"success": False, "error": "Unsupported database type"}
            
            return {"success": True, "message": f"Query {pid} terminated"}
        except Exception as e:
            return {"success": False, "error": str(e)}
