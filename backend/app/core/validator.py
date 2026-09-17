from fastapi import HTTPException

from app.core.constants import UserStatus
from app.models import User


class UserStatusValidator:
    @staticmethod
    def ensure_authenticatable(user: User) -> None:
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="email not verified")
        if user.status == UserStatus.PENDING:
            raise HTTPException(status_code=403, detail="account pending approval")
        if user.role is None:
            raise HTTPException(
                status_code=403, detail="account pending role assignment"
            )
        if user.status == UserStatus.REJECTED:
            raise HTTPException(status_code=403, detail="account rejected")
        if user.status == UserStatus.BANNED:
            raise HTTPException(status_code=403, detail="account banned")

    @staticmethod
    def ensure_approvable(user: User) -> None:
        if user.status == UserStatus.ACTIVE:
            raise HTTPException(status_code=409, detail="user is already active")
        if user.status == UserStatus.BANNED:
            raise HTTPException(status_code=409, detail="cannot approve a banned user")
        if user.status == UserStatus.REJECTED:
            raise HTTPException(
                status_code=409, detail="cannot approve a rejected user"
            )
        if user.status != UserStatus.PENDING:
            raise HTTPException(
                status_code=409, detail="only pending users can be approved"
            )
