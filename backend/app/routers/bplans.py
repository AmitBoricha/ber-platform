from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services import analytics

router = APIRouter(prefix="/bplans", tags=["bplans"])


@router.get("/", response_model=list[schemas.BPlanOut])
def list_bplans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Role-aware B-Plan listing.
    - developer: only their own parcels
    - everyone else: full zone view
    """
    query = db.query(models.BPlan)
    if current_user.role == "developer":
        query = query.filter(models.BPlan.developer == current_user.organisation)
    return query.all()


@router.get("/funnel")
def get_bplan_funnel(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Zone-wide B-Plan status breakdown (approved/pending/blocked)."""
    return analytics.bplan_funnel(db)


@router.get("/investment-impact")
def get_investment_impact(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("municipality", "fbb")),
):
    """Investment value waiting on pending/blocked approvals.
    Restricted to municipality and FBB roles."""
    return analytics.investment_waiting_on_approvals(db)
