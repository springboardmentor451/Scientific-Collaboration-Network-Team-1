from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from jose import JWTError

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
)
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token, RefreshTokenRequest

router = APIRouter()

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user account with a specified role:
    - Researcher
    - Reviewer
    - Institution Admin
    - System Admin
    """
    # Check if user with email or username already exists
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_in.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this username already exists."
            )

    # Hash password and save new user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role.value if isinstance(user_in.role, UserRole) else user_in.role,
        is_active=True,
        is_superuser=(user_in.role == UserRole.SYSTEM_ADMIN or user_in.role == "System Admin")
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate Tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    
    # Store refresh token in DB for validation/invalidation
    user.refresh_token = refresh_token
    db.commit()

    return {
        "message": "User registered successfully",
        "user": UserResponse.model_validate(user),
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.role,
            "expires_in_seconds": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    }


@router.post("/login", response_model=Token)
def login(
    login_data: Optional[UserLogin] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(OAuth2PasswordRequestForm),
    db: Session = Depends(get_db)
) -> Any:
    """
    Login endpoint supporting both JSON payload and OAuth2 Form data.
    Returns Access Token and Refresh Token.
    """
    username_or_email = None
    password = None

    if login_data and login_data.username_or_email:
        username_or_email = login_data.username_or_email
        password = login_data.password
    elif form_data and form_data.username:
        username_or_email = form_data.username
        password = form_data.password
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing credentials"
        )

    # Authenticate user by username or email
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

    # Issue Tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)

    # Store active refresh token
    user.refresh_token = refresh_token
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Refresh Access Token using a valid Refresh Token.
    """
    token_str = refresh_in.refresh_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token_str, is_refresh=True)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id_str is None or token_type != "refresh":
            raise credentials_exception
            
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exception

    # Check if refresh token matches active stored token
    if user.refresh_token != token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or invalidated. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue fresh Access Token and updated Refresh Token
    new_access_token = create_access_token(subject=user.id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.id)

    user.refresh_token = new_refresh_token
    db.commit()

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        role=user.role,
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Fetch profile of currently authenticated user.
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Revoke user refresh token upon logout.
    """
    current_user.refresh_token = None
    db.commit()
    return {"message": "Logged out successfully. Refresh token revoked."}
