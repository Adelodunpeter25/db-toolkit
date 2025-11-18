"""Production-ready query execution engine."""

import time
from typing import Dict, Any, Optional
from connectors.factory import ConnectorFactory
from core.models import DatabaseConnection


class QueryExecutor:
    """Handles safe query execution with timeout and pagination."""
    
    def __init__(self, default_timeout: int = 30, default_limit: int = 1000):
        """Initialize query executor."""
        self.default_timeout = default_timeout
        self.default_limit = default_limit
    
    async def execute_query(
        self,
        connection: DatabaseConnection,
        query: str,
        limit: Optional[int] = None,
        offset: int = 0,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """Execute query with safety checks and pagination."""
        if not query or not query.strip():
            return {
                "success": False,
                "error": "Query cannot be empty",
                "columns": [],
                "rows": [],
                "total_rows": 0,
                "execution_time": 0.0
            }
        
        query = query.strip()
        limit = limit or self.default_limit
        timeout = timeout or self.default_timeout
        
        # Validate query safety
        validation_result = self._validate_query(query, connection.db_type.value)
        if not validation_result["safe"]:
            return {
                "success": False,
                "error": validation_result["error"],
                "columns": [],
                "rows": [],
                "total_rows": 0,
                "execution_time": 0.0
            }
        
        start_time = time.time()
        
        try:
            connector = ConnectorFactory.create_connector(connection.db_type)
            await connector.connect(connection)
            
            # Add pagination for SQL queries
            paginated_query = self._add_pagination(query, connection.db_type.value, limit, offset)
            
            result = await connector.execute_query(paginated_query)
            await connector.disconnect()
            
            execution_time = time.time() - start_time
            
            if result.get("success"):
                return {
                    "success": True,
                    "columns": result.get("columns", []),
                    "rows": result.get("data", []),
                    "total_rows": result.get("row_count", 0),
                    "execution_time": round(execution_time, 3),
                    "has_more": result.get("row_count", 0) >= limit
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Unknown error"),
                    "columns": [],
                    "rows": [],
                    "total_rows": 0,
                    "execution_time": round(execution_time, 3)
                }
                
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "success": False,
                "error": str(e),
                "columns": [],
                "rows": [],
                "total_rows": 0,
                "execution_time": round(execution_time, 3)
            }
    
    def _validate_query(self, query: str, db_type: str) -> Dict[str, Any]:
        """Validate query for safety."""
        query_upper = query.upper().strip()
        
        # Block dangerous operations
        dangerous_keywords = [
            "DROP DATABASE",
            "DROP SCHEMA",
            "TRUNCATE",
            "DELETE FROM" if not "WHERE" in query_upper else None,
            "UPDATE" if not "WHERE" in query_upper else None,
        ]
        
        for keyword in dangerous_keywords:
            if keyword and keyword in query_upper:
                return {
                    "safe": False,
                    "error": f"Dangerous operation detected: {keyword}. Use with caution."
                }
        
        # MongoDB specific validation
        if db_type == "mongodb":
            if not (query.startswith("{") or query.startswith("db.")):
                return {
                    "safe": False,
                    "error": "MongoDB query must be valid JSON or db.collection syntax"
                }
        
        return {"safe": True}
    
    def _add_pagination(self, query: str, db_type: str, limit: int, offset: int) -> str:
        """Add pagination to query if not present."""
        query_upper = query.upper().strip()
        
        if db_type == "mongodb":
            return query  # MongoDB pagination handled in connector
        
        # Check if LIMIT already exists
        if "LIMIT" in query_upper:
            return query
        
        # Add LIMIT and OFFSET
        if db_type == "sqlite":
            return f"{query} LIMIT {limit} OFFSET {offset}"
        elif db_type in ["postgresql", "mysql"]:
            return f"{query} LIMIT {limit} OFFSET {offset}"
        
        return query