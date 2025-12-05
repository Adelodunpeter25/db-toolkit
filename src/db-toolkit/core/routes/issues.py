"""Issue management routes."""

import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException

from core.schemas.issue import IssueCreate, IssueResponse
from utils.logger import logger

router = APIRouter()

# In-memory storage (replace with database in production)
issues_db = []


@router.post("/issues", response_model=IssueResponse)
async def create_issue(issue: IssueCreate):
    """Create a new issue."""
    try:
        new_issue = {
            "id": str(uuid.uuid4()),
            "title": issue.title,
            "description": issue.description,
            "issue_type": issue.issue_type,
            "environment": issue.environment,
            "status": "open",
            "created_at": datetime.utcnow()
        }
        
        issues_db.append(new_issue)
        logger.info(f"Issue created: {new_issue['id']} - {issue.title}")
        
        return new_issue
    except Exception as e:
        logger.error(f"Failed to create issue: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create issue")


@router.get("/issues", response_model=List[IssueResponse])
async def get_issues():
    """Get all issues."""
    return issues_db


@router.get("/issues/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str):
    """Get issue by ID."""
    issue = next((i for i in issues_db if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.delete("/issues/{issue_id}")
async def delete_issue(issue_id: str):
    """Delete an issue."""
    global issues_db
    issues_db = [i for i in issues_db if i["id"] != issue_id]
    return {"success": True}
