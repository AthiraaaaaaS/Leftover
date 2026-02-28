"""Auth API routes."""
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.auth.jwt import hash_password, verify_password, create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    DonorRegisterRequest,
    VolunteerRegisterRequest,
    LoginRequest,
    TokenResponse,
    DonorProfile,
    VolunteerProfile,
)


router = APIRouter(tags=["auth"])


def _user_to_response(u: User) -> dict:
    """Convert User model to frontend User shape."""
    base = {
        "id": u.id,
        "role": u.role,
        "username": u.username,
        "createdAt": u.created_at.isoformat() if u.created_at else datetime.utcnow().isoformat(),
    }
    if u.role == "DONOR":
        base["donor"] = DonorProfile(
            full_name=u.donor_full_name or "",
            phone=u.donor_phone or "",
            organization=u.donor_organization,
            aadhaar_last4=u.donor_aadhaar_last4,
            aadhaar_consent=u.donor_aadhaar_consent or False,
            id_front_image=u.donor_id_front_image,
            id_back_image=u.donor_id_back_image,
        ).model_dump()
        base["volunteer"] = None
    else:
        base["volunteer"] = VolunteerProfile(
            full_name=u.volunteer_full_name or "",
            phone=u.volunteer_phone or "",
            city=u.volunteer_city,
            has_vehicle=u.volunteer_has_vehicle or False,
        ).model_dump()
        base["donor"] = None
    return base


def _generate_user_id(prefix: str = "U") -> str:
    import random
    return f"{prefix}-{random.randint(100000, 999999)}"


@router.post("/register/donor", response_model=TokenResponse)
async def register_donor(
    req: DonorRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new donor. Optionally include id_front_image and id_back_image as base64 data URLs in JSON."""
    uname = req.username.strip().lower()
    if not uname:
        raise HTTPException(400, "Username required")
    if not req.password or len(req.password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")
    if not req.full_name.strip():
        raise HTTPException(400, "Full name required")
    if not req.phone.strip():
        raise HTTPException(400, "Phone required")
    if not req.aadhaar_consent:
        raise HTTPException(400, "Consent required")

    result = await db.execute(select(User).where(User.username == uname))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Username already exists")

    user = User(
        id=_generate_user_id(),
        role="DONOR",
        username=uname,
        hashed_password=hash_password(req.password),
        donor_full_name=req.full_name.strip(),
        donor_phone=req.phone.strip(),
        donor_organization=req.organization.strip() or None if req.organization else None,
        donor_aadhaar_last4=req.aadhaar_last4.strip() or None if req.aadhaar_last4 else None,
        donor_aadhaar_consent=req.aadhaar_consent,
        donor_id_front_image=req.id_front_image,
        donor_id_back_image=req.id_back_image,
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": user.id})
    return TokenResponse(token=token, user=_user_to_response(user))


@router.post("/register/volunteer", response_model=TokenResponse)
async def register_volunteer(
    req: VolunteerRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new volunteer."""
    uname = req.username.strip().lower()
    if not uname:
        raise HTTPException(400, "Username required")
    if not req.password or len(req.password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")
    if not req.full_name.strip():
        raise HTTPException(400, "Full name required")
    if not req.phone.strip():
        raise HTTPException(400, "Phone required")

    result = await db.execute(select(User).where(User.username == uname))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Username already exists")

    user = User(
        id=_generate_user_id(),
        role="VOLUNTEER",
        username=uname,
        hashed_password=hash_password(req.password),
        volunteer_full_name=req.full_name.strip(),
        volunteer_phone=req.phone.strip(),
        volunteer_city=req.city.strip() or None if req.city else None,
        volunteer_has_vehicle=req.has_vehicle,
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": user.id})
    return TokenResponse(token=token, user=_user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login with username and password."""
    uname = req.username.strip().lower()
    result = await db.execute(select(User).where(User.username == uname))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")

    token = create_access_token({"sub": user.id})
    return TokenResponse(token=token, user=_user_to_response(user))


@router.get("/me")
async def me(
    user: Annotated[User, Depends(get_current_user)],
):
    """Get current authenticated user."""
    return _user_to_response(user)


@router.post("/logout")
async def logout():
    """Logout - client should discard token (stateless JWT)."""
    return {"ok": True}

