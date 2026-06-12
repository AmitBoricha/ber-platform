from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services import analytics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=schemas.OverviewOut)
def get_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Single endpoint returning a role-specific summary.
    Each role sees different metrics computed from the same underlying data,
    via the pandas analytics service.
    """
    capacity = analytics.zone_capacity_summary(db)
    funnel = analytics.bplan_funnel(db)
    pipeline = analytics.pipeline_summary(db)
    decision = analytics.decision_time_metric(db)
    phantom = analytics.phantom_reservation_insight(db)

    role = current_user.role
    metrics: dict = {}
    insights: list[str] = []

    if role == "fbb":
        metrics = {
            "tenant_pipeline_total": pipeline["total"],
            "energy_demand_12mo_mw": pipeline["total_demand_mw"],
            "avg_connection_days": decision["avg_decision_days_with_platform"],
            "bplans_approved": next((b["count"] for b in funnel["by_status"] if b["status"] == "approved"), 0),
        }
        insights = [
            f"{phantom['phantom_reserved_mw']} MW of phantom-reserved capacity identified. "
            f"If released, {phantom['companies_unlockable']} pipeline companies can connect immediately.",
        ]

    elif role == "developer":
        own_bplans = [b for b in db.query(models.BPlan).filter(models.BPlan.developer == current_user.organisation)]
        pending = [b for b in own_bplans if b.status in ("pending", "blocked")]
        metrics = {
            "own_active_projects": len(own_bplans),
            "own_pending_approvals": len(pending),
            "avg_zone_decision_days": decision["avg_decision_days_with_platform"],
            "zone_available_capacity_mw": capacity["available_mw"],
        }
        insights = [
            f"You have {len(pending)} parcel(s) pending approval. "
            f"Zone-wide, {phantom['phantom_reserved_mw']} MW of phantom capacity could be released soon.",
        ]

    elif role == "municipality":
        impact = analytics.investment_waiting_on_approvals(db, top_n=5)
        total_waiting = sum(i["investment_value_eur"] for i in impact)
        metrics = {
            "bplans_under_review": next((b["count"] for b in funnel["by_status"] if b["status"] == "pending"), 0),
            "investment_waiting_eur": total_waiting,
            "total_zone_area_ha": funnel["total_area_ha"],
            "approved_this_period": next((b["count"] for b in funnel["by_status"] if b["status"] == "approved"), 0),
        }
        insights = [
            f"€{total_waiting:,.0f} of member investment is currently waiting on pending approvals.",
        ]

    elif role == "grid_operator":
        metrics = {
            "total_capacity_mw": capacity["total_mw"],
            "available_mw": capacity["available_mw"],
            "phantom_reserved_mw": capacity["phantom_reserved_mw"],
            "pipeline_demand_mw": pipeline["total_demand_mw"],
        }
        insights = [
            f"Releasing phantom reservations would make {phantom['available_after_release_mw']} MW available, "
            f"unblocking {phantom['companies_unlockable']} companies in the pipeline.",
        ]

    return schemas.OverviewOut(
        role=role,
        organisation=current_user.organisation,
        metrics=metrics,
        insights=insights,
    )
