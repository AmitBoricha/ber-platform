from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    organisation: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    organisation: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    organisation: str


# ── B-Plans ───────────────────────────────────────────
class BPlanOut(BaseModel):
    id: int
    parcel_name: str
    developer: str
    status: str
    days_in_review: int
    investment_value_eur: float
    municipality: str
    area_ha: float
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Energy ────────────────────────────────────────────
class EnergyRecordOut(BaseModel):
    id: int
    substation: str
    total_capacity_mw: float
    in_use_mw: float
    real_reserved_mw: float
    phantom_reserved_mw: float

    class Config:
        from_attributes = True


class EnergyCommunityMemberOut(BaseModel):
    id: int
    member_name: str
    status: str

    class Config:
        from_attributes = True


# ── Pipeline ──────────────────────────────────────────
class PipelineItemOut(BaseModel):
    id: int
    company_name: str
    sector: str
    size_sqm: float
    energy_need_mw: float
    target_quarter: str
    developer: Optional[str]
    status: str
    blocker_detail: Optional[str]

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────
class OverviewOut(BaseModel):
    role: str
    organisation: str
    metrics: dict
    insights: list[str]
