from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.api.deps import get_db, get_current_user, RequireRole
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user profile (Accessible by any authenticated user).
    """
    return UserResponse.model_validate(current_user)

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole([UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]))
) -> Any:
    """
    Get list of all users.
    Role Required: Institution Admin or System Admin.
    """
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]

# RBAC Test Endpoints for each role:

@router.get("/researcher-zone")
def researcher_zone(
    current_user: User = Depends(RequireRole([UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]))
):
    """
    Role Protected Endpoint: Researcher
    Accessible by: Researcher, System Admin
    """
    return {
        "status": "success",
        "message": f"Welcome to Researcher Workspace, {current_user.full_name or current_user.username}!",
        "role": current_user.role,
        "capabilities": ["Submit Grants", "Publish Papers", "Analyze Network", "Co-author Graph"]
    }

@router.get("/reviewer-zone")
def reviewer_zone(
    current_user: User = Depends(RequireRole([UserRole.REVIEWER, UserRole.SYSTEM_ADMIN]))
):
    """
    Role Protected Endpoint: Reviewer
    Accessible by: Reviewer, System Admin
    """
    return {
        "status": "success",
        "message": f"Welcome to Peer Review Portal, {current_user.full_name or current_user.username}!",
        "role": current_user.role,
        "capabilities": ["Evaluate Submissions", "Assign Citation Scores", "Peer Review Papers", "Grant Approval"]
    }

@router.get("/institution-admin-zone")
def institution_admin_zone(
    current_user: User = Depends(RequireRole([UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]))
):
    """
    Role Protected Endpoint: Institution Admin
    Accessible by: Institution Admin, System Admin
    """
    return {
        "status": "success",
        "message": f"Welcome to University Administration Dashboard, {current_user.full_name or current_user.username}!",
        "role": current_user.role,
        "capabilities": ["Manage Department Faculty", "Audit Grant Expenditures", "Institution Network Reports"]
    }

@router.get("/system-admin-zone")
def system_admin_zone(
    current_user: User = Depends(RequireRole([UserRole.SYSTEM_ADMIN]))
):
    """
    Role Protected Endpoint: System Admin
    Accessible ONLY by: System Admin
    """
    return {
        "status": "success",
        "message": f"Welcome to System Control Console, {current_user.full_name or current_user.username}!",
        "role": current_user.role,
        "capabilities": ["Manage Security Tokens", "Database Backup/Restore", "Role Escalation", "System Audit Logs"]
    }
