"""Analytics routes for database monitoring."""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from operations.analytics_manager import AnalyticsManager
from operations.connection_manager import ConnectionManager

router = APIRouter()
connection_manager = ConnectionManager()


class KillQueryRequest(BaseModel):
    """Kill query request."""
    pid: int


class QueryPlanRequest(BaseModel):
    """Query plan request."""
    query: str


@router.get("/connections/{connection_id}")
async def get_analytics(connection_id: int):
    """Get database analytics."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        result = await analytics_manager.get_analytics(config, connection_id)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connections/{connection_id}/history")
async def get_historical_data(connection_id: int, hours: int = Query(default=3, ge=1, le=3)):
    """Get historical analytics data."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        history = analytics_manager.get_historical_data(connection_id, hours)
        
        return {"success": True, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connections/{connection_id}/query-plan")
async def get_query_plan(connection_id: int, request: QueryPlanRequest):
    """Get query execution plan."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        result = await analytics_manager.get_query_plan(request.query, config)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connections/{connection_id}/slow-queries")
async def get_slow_queries(connection_id: int, hours: int = Query(default=24, ge=1, le=24)):
    """Get slow query log."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        slow_queries = analytics_manager.get_slow_query_log(connection_id, hours)
        
        return {"success": True, "slow_queries": slow_queries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connections/{connection_id}/table-stats")
async def get_table_stats(connection_id: int):
    """Get table-level statistics."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        table_stats = await analytics_manager.get_table_statistics(config)
        
        return {"success": True, "table_stats": table_stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connections/{connection_id}/pool-stats")
async def get_pool_stats(connection_id: int):
    """Get connection pool statistics."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        pool_stats = analytics_manager.get_connection_pool_stats()
        
        return {"success": True, "pool_stats": pool_stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connections/{connection_id}/export-pdf")
async def export_pdf(connection_id: int):
    """Export analytics to PDF."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        
        pdf_bytes = await analytics_manager.export_to_pdf(
            connection_id,
            config.name,
            config
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_{config.name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connections/{connection_id}/kill")
async def kill_query(connection_id: int, request: KillQueryRequest):
    """Kill a running query."""
    try:
        connection_info = connection_manager.get_connection(connection_id)
        if not connection_info:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        config, connector = connection_info
        analytics_manager = AnalyticsManager(connector.connection)
        result = await analytics_manager.kill_query(request.pid, config)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
