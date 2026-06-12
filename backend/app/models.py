from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # fbb, developer, municipality, grid_operator
    organisation = Column(String, nullable=False)


class BPlan(Base):
    __tablename__ = "bplans"

    id = Column(Integer, primary_key=True, index=True)
    parcel_name = Column(String, nullable=False)
    developer = Column(String, nullable=False)
    status = Column(String, nullable=False)  # approved, pending, blocked
    days_in_review = Column(Integer, default=0)
    investment_value_eur = Column(Float, default=0)
    municipality = Column(String, nullable=False)
    area_ha = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)


class EnergyRecord(Base):
    __tablename__ = "energy_records"

    id = Column(Integer, primary_key=True, index=True)
    substation = Column(String, nullable=False)
    total_capacity_mw = Column(Float, nullable=False)
    in_use_mw = Column(Float, nullable=False)
    real_reserved_mw = Column(Float, nullable=False)
    phantom_reserved_mw = Column(Float, nullable=False)


class PipelineItem(Base):
    __tablename__ = "pipeline_items"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    size_sqm = Column(Float, default=0)
    energy_need_mw = Column(Float, default=0)
    target_quarter = Column(String, nullable=False)
    developer = Column(String, nullable=True)
    status = Column(String, nullable=False)  # ready, bplan_pending, grid_blocked
    blocker_detail = Column(String, nullable=True)


class EnergyCommunityMember(Base):
    __tablename__ = "energy_community_members"

    id = Column(Integer, primary_key=True, index=True)
    member_name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # signed, in_discussion, regulatory_review


class ZoneMetric(Base):
    __tablename__ = "zone_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    unit = Column(String, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
