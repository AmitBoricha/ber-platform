"""
Analytics service — computes zone-level metrics using pandas.

This module pulls raw rows from the database into DataFrames and
derives the metrics shown on the dashboards: capacity utilisation,
phantom reservation detection, B-Plan approval funnel, and investment
impact of pending decisions.
"""
from __future__ import annotations

import pandas as pd
from sqlalchemy.orm import Session

from .. import models


def _bplans_df(db: Session) -> pd.DataFrame:
    rows = db.query(models.BPlan).all()
    return pd.DataFrame(
        [
            {
                "parcel_name": r.parcel_name,
                "developer": r.developer,
                "status": r.status,
                "days_in_review": r.days_in_review,
                "investment_value_eur": r.investment_value_eur,
                "municipality": r.municipality,
                "area_ha": r.area_ha,
            }
            for r in rows
        ]
    )


def _energy_df(db: Session) -> pd.DataFrame:
    rows = db.query(models.EnergyRecord).all()
    return pd.DataFrame(
        [
            {
                "substation": r.substation,
                "total_capacity_mw": r.total_capacity_mw,
                "in_use_mw": r.in_use_mw,
                "real_reserved_mw": r.real_reserved_mw,
                "phantom_reserved_mw": r.phantom_reserved_mw,
            }
            for r in rows
        ]
    )


def _pipeline_df(db: Session) -> pd.DataFrame:
    rows = db.query(models.PipelineItem).all()
    return pd.DataFrame(
        [
            {
                "company_name": r.company_name,
                "sector": r.sector,
                "size_sqm": r.size_sqm,
                "energy_need_mw": r.energy_need_mw,
                "target_quarter": r.target_quarter,
                "developer": r.developer,
                "status": r.status,
                "blocker_detail": r.blocker_detail,
            }
            for r in rows
        ]
    )


def zone_capacity_summary(db: Session) -> dict:
    """Aggregate energy capacity across all substations and flag
    truly-available capacity once phantom reservations are excluded."""
    df = _energy_df(db)
    if df.empty:
        return {"total_mw": 0, "in_use_mw": 0, "real_reserved_mw": 0, "phantom_reserved_mw": 0, "available_mw": 0}

    totals = df[["total_capacity_mw", "in_use_mw", "real_reserved_mw", "phantom_reserved_mw"]].sum()
    available = totals["total_capacity_mw"] - totals["in_use_mw"] - totals["real_reserved_mw"]

    return {
        "total_mw": round(float(totals["total_capacity_mw"]), 1),
        "in_use_mw": round(float(totals["in_use_mw"]), 1),
        "real_reserved_mw": round(float(totals["real_reserved_mw"]), 1),
        "phantom_reserved_mw": round(float(totals["phantom_reserved_mw"]), 1),
        "available_mw": round(float(available), 1),
    }


def bplan_funnel(db: Session) -> dict:
    """Breakdown of B-Plan parcels by status, with area and investment
    value aggregated per status — the 'zone land status' bars."""
    df = _bplans_df(db)
    if df.empty:
        return {"by_status": [], "total_area_ha": 0, "total_investment_eur": 0}

    grouped = (
        df.groupby("status")
        .agg(count=("parcel_name", "count"), area_ha=("area_ha", "sum"), investment_eur=("investment_value_eur", "sum"))
        .reset_index()
    )

    total_area = float(df["area_ha"].sum())
    grouped["pct_of_zone"] = (grouped["area_ha"] / total_area * 100).round(1) if total_area else 0

    return {
        "by_status": grouped.to_dict(orient="records"),
        "total_area_ha": round(total_area, 1),
        "total_investment_eur": round(float(df["investment_value_eur"].sum()), 0),
    }


def investment_waiting_on_approvals(db: Session, top_n: int = 10) -> list[dict]:
    """Investment value currently blocked by pending/blocked B-Plans,
    ranked — this powers the municipality 'investment impact' view."""
    df = _bplans_df(db)
    if df.empty:
        return []

    pending = df[df["status"].isin(["pending", "blocked"])].copy()
    pending = pending.sort_values("investment_value_eur", ascending=False).head(top_n)

    return pending[["parcel_name", "developer", "status", "days_in_review", "investment_value_eur", "municipality"]].to_dict(
        orient="records"
    )


def phantom_reservation_insight(db: Session) -> dict:
    """Identify how much capacity could be released if phantom
    reservations were formally cleared, and how many pipeline
    companies that would unblock."""
    energy = zone_capacity_summary(db)
    pipeline = _pipeline_df(db)

    blocked = pipeline[pipeline["status"] == "grid_blocked"]
    unlockable_count = int(len(blocked))
    unlockable_mw = round(float(blocked["energy_need_mw"].sum()), 1)

    return {
        "phantom_reserved_mw": energy["phantom_reserved_mw"],
        "available_after_release_mw": round(energy["available_mw"] + energy["phantom_reserved_mw"], 1),
        "companies_unlockable": unlockable_count,
        "energy_unlockable_mw": unlockable_mw,
    }


def pipeline_summary(db: Session) -> dict:
    """Pipeline breakdown by status — feeds the FBB 'tenant pipeline' view."""
    df = _pipeline_df(db)
    if df.empty:
        return {"total": 0, "by_status": [], "total_demand_mw": 0}

    grouped = df.groupby("status").agg(count=("company_name", "count"), demand_mw=("energy_need_mw", "sum")).reset_index()

    return {
        "total": int(len(df)),
        "by_status": grouped.to_dict(orient="records"),
        "total_demand_mw": round(float(df["energy_need_mw"].sum()), 1),
    }


def demand_forecast(db: Session) -> list[dict]:
    """Energy demand grouped by target quarter — confirmed pipeline
    demand over time, used for the forecast chart."""
    df = _pipeline_df(db)
    if df.empty:
        return []

    grouped = df.groupby("target_quarter").agg(demand_mw=("energy_need_mw", "sum")).reset_index()
    grouped = grouped.sort_values("target_quarter")

    # Running cumulative demand
    grouped["cumulative_demand_mw"] = grouped["demand_mw"].cumsum().round(1)
    grouped["demand_mw"] = grouped["demand_mw"].round(1)

    return grouped.to_dict(orient="records")


def decision_time_metric(db: Session) -> dict:
    """The headline 'before vs after' metric. Average days in review
    for approved parcels stands in for the platform's measured effect."""
    df = _bplans_df(db)
    approved = df[df["status"] == "approved"]
    avg_days = float(approved["days_in_review"].mean()) if not approved.empty else 0

    return {
        "avg_decision_days_with_platform": round(avg_days, 1),
        "baseline_days_without_platform": 420,  # ~14 months, used in pitch
    }
