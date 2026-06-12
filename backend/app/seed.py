"""
Seed the database with realistic dummy data for the BER+ Coordination
Intelligence Layer demo — 4 demo users (one per role), B-Plans, energy
records, pipeline items, and energy community members.

Run with:  python -m app.seed
"""
from .database import Base, engine, SessionLocal
from . import models, auth

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── Wipe existing data (idempotent re-seed for local dev) ─────────
for model in [models.User, models.BPlan, models.EnergyRecord, models.PipelineItem, models.EnergyCommunityMember, models.ZoneMetric]:
    db.query(model).delete()
db.commit()

# ── Demo users — one per role ──────────────────────────────────────
demo_users = [
    {"email": "fbb@ber-plus.de", "password": "demo1234", "role": "fbb", "organisation": "FBB"},
    {"email": "developer@ber-plus.de", "password": "demo1234", "role": "developer", "organisation": "SEGRO"},
    {"email": "municipality@ber-plus.de", "password": "demo1234", "role": "municipality", "organisation": "WFG Dahme-Spreewald"},
    {"email": "grid@ber-plus.de", "password": "demo1234", "role": "grid_operator", "organisation": "e.dis Netz"},
]

for u in demo_users:
    db.add(models.User(
        email=u["email"],
        hashed_password=auth.get_password_hash(u["password"]),
        role=u["role"],
        organisation=u["organisation"],
    ))

# ── B-Plans ─────────────────────────────────────────────────────────
bplans = [
    {"parcel_name": "Schönefeld Nord A", "developer": "SEGRO", "status": "approved", "days_in_review": 12, "investment_value_eur": 220_000_000, "municipality": "Schönefeld", "area_ha": 84},
    {"parcel_name": "Gewerbepark Ost", "developer": "GOLDBECK", "status": "approved", "days_in_review": 34, "investment_value_eur": 180_000_000, "municipality": "Schönefeld", "area_ha": 56},
    {"parcel_name": "Wohnquartier Süd", "developer": "BUWOG", "status": "pending", "days_in_review": 67, "investment_value_eur": 140_000_000, "municipality": "Schönefeld", "area_ha": 38},
    {"parcel_name": "Logistikzone West", "developer": "Alpine Immobilien", "status": "pending", "days_in_review": 88, "investment_value_eur": 220_000_000, "municipality": "Dahme-Spreewald", "area_ha": 72},
    {"parcel_name": "Mixed-use Hub C", "developer": "Reiss & Co.", "status": "pending", "days_in_review": 102, "investment_value_eur": 180_000_000, "municipality": "Dahme-Spreewald", "area_ha": 42},
    {"parcel_name": "Büropark Terminal", "developer": "GSG Berlin", "status": "pending", "days_in_review": 145, "investment_value_eur": 95_000_000, "municipality": "Schönefeld", "area_ha": 28},
    {"parcel_name": "Industrial Zone B2", "developer": "Taurecon", "status": "blocked", "days_in_review": 210, "investment_value_eur": 130_000_000, "municipality": "Dahme-Spreewald", "area_ha": 64},
    {"parcel_name": "Wärmenetz Nord", "developer": "e.distherm", "status": "blocked", "days_in_review": 178, "investment_value_eur": 45_000_000, "municipality": "Schönefeld", "area_ha": 18},
    {"parcel_name": "Residential Block N", "developer": "Adler AG", "status": "approved", "days_in_review": 22, "investment_value_eur": 110_000_000, "municipality": "Schönefeld", "area_ha": 31},
    {"parcel_name": "Innovation Campus", "developer": "Arcadis", "status": "approved", "days_in_review": 28, "investment_value_eur": 75_000_000, "municipality": "Dahme-Spreewald", "area_ha": 22},
]

for b in bplans:
    db.add(models.BPlan(**b))

# ── Energy records (3 substations) ──────────────────────────────────
energy_records = [
    {"substation": "Substation 1 — Schönefeld Nord", "total_capacity_mw": 50, "in_use_mw": 24, "real_reserved_mw": 6, "phantom_reserved_mw": 8},
    {"substation": "Substation 2 — Terminal West", "total_capacity_mw": 45, "in_use_mw": 22, "real_reserved_mw": 4, "phantom_reserved_mw": 7},
    {"substation": "Substation 3 — Dahme-Spreewald", "total_capacity_mw": 25, "in_use_mw": 12, "real_reserved_mw": 2, "phantom_reserved_mw": 3},
]

for e in energy_records:
    db.add(models.EnergyRecord(**e))

# ── Pipeline items ────────────────────────────────────────────────
pipeline_items = [
    {"company_name": "SEGRO Logistics Hub Phase 6B", "sector": "Logistics", "size_sqm": 22000, "energy_need_mw": 6.1, "target_quarter": "2026-Q3", "developer": "SEGRO", "status": "ready", "blocker_detail": None},
    {"company_name": "Cold storage operator", "sector": "Logistics", "size_sqm": 8500, "energy_need_mw": 4.8, "target_quarter": "2026-Q4", "developer": None, "status": "ready", "blocker_detail": None},
    {"company_name": "Automotive supplier", "sector": "Manufacturing", "size_sqm": 9200, "energy_need_mw": 3.2, "target_quarter": "2027-Q1", "developer": None, "status": "ready", "blocker_detail": None},
    {"company_name": "Biotech R&D facility", "sector": "Life Sciences", "size_sqm": 6500, "energy_need_mw": 2.8, "target_quarter": "2027-Q2", "developer": None, "status": "ready", "blocker_detail": None},
    {"company_name": "E-commerce fulfilment centre", "sector": "Logistics", "size_sqm": 18000, "energy_need_mw": 5.4, "target_quarter": "2026-Q4", "developer": "GOLDBECK", "status": "bplan_pending", "blocker_detail": "Waiting on Gewerbepark Ost B-Plan"},
    {"company_name": "Pharma manufacturing", "sector": "Manufacturing", "size_sqm": 14000, "energy_need_mw": 5.5, "target_quarter": "2027-Q3", "developer": "Alpine Immobilien", "status": "bplan_pending", "blocker_detail": "Waiting on Logistikzone West B-Plan"},
    {"company_name": "Food processing plant", "sector": "Manufacturing", "size_sqm": 11000, "energy_need_mw": 4.1, "target_quarter": "2027-Q3", "developer": "Reiss & Co.", "status": "bplan_pending", "blocker_detail": "Waiting on Mixed-use Hub C B-Plan"},
    {"company_name": "Data centre operator", "sector": "Technology", "size_sqm": 5000, "energy_need_mw": 8.4, "target_quarter": "2027-Q2", "developer": "GOLDBECK", "status": "grid_blocked", "blocker_detail": "Substation 2 — phantom reservation"},
    {"company_name": "Industrial Unit D", "sector": "Manufacturing", "size_sqm": 8400, "energy_need_mw": 3.2, "target_quarter": "2027-Q1", "developer": "SEGRO", "status": "grid_blocked", "blocker_detail": "Substation 2 — phantom reservation"},
]

for p in pipeline_items:
    db.add(models.PipelineItem(**p))

# ── Energy community (§42c EnWG) ────────────────────────────────────
energy_community = [
    {"member_name": "FBB", "status": "signed"},
    {"member_name": "SEGRO", "status": "signed"},
    {"member_name": "e.distherm", "status": "signed"},
    {"member_name": "GOLDBECK", "status": "in_discussion"},
    {"member_name": "Alpine Immobilien", "status": "in_discussion"},
    {"member_name": "e.dis Netz", "status": "regulatory_review"},
]

for m in energy_community:
    db.add(models.EnergyCommunityMember(**m))

db.commit()
db.close()

print("Database seeded successfully.")
print("\nDemo accounts (password: demo1234):")
for u in demo_users:
    print(f"  {u['role']:14s} -> {u['email']}  ({u['organisation']})")
