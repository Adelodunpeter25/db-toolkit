"""API request/response schemas."""

from typing import Optional
from pydantic import BaseModel, Field
from core.models import DatabaseType


class ConnectionRequest(BaseModel):
    """Connection creation request."""
    name: str
    db_type: DatabaseType
    host: str = None
    port: int = None
    username: str = None
    password: str = None
    database: str = None
    file_path: str = None


class QueryRequest(BaseModel):
    """Query execution request."""
    query: str = Field(..., min_length=1, description="SQL or MongoDB query")
    limit: Optional[int] = Field(1000, ge=1, le=10000, description="Maximum rows to return")
    offset: int = Field(0, ge=0, description="Number of rows to skip")
    timeout: Optional[int] = Field(30, ge=1, le=300, description="Query timeout in seconds")


class QueryResponse(BaseModel):
    """Query execution response."""
    success: bool
    columns: list[str] = []
    rows: list[list] = []
    total_rows: int = 0
    execution_time: float = 0.0
    has_more: bool = False
    error: Optional[str] = None