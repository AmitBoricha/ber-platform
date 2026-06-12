from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services import analytics

router = APIRouter(prefix="/energy", tags=["energy"])


@router.get("/capacity")
def get_capacity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Zone-wide energy capacity summary: total, in-use, reserved, available."""
    return analytics.zone_capacity_summary(db)


@router.get("/substations", response_model=list[schemas.EnergyRecordOut])
def list_substations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.EnergyRecord).all()


@router.get("/phantom-insight")
def get_phantom_insight(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("grid_operator", "fbb", "developer")),
):
    """Phantom reservation analysis — how much capacity could be released
    and how many pipeline companies it would unblock."""
    return analytics.phantom_reservation_insight(db)


@router.get("/demand-forecast")
def get_demand_forecast(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Energy demand forecast grouped by quarter, from confirmed pipeline."""
    return analytics.demand_forecast(db)


@router.get("/energy-community", response_model=list[schemas.EnergyCommunityMemberOut])
def get_energy_community(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """§42c EnWG energy community setup status by member."""
    return db.query(models.EnergyCommunityMember).all()
