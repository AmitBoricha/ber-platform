# BER+ Coordination Intelligence Layer

A full-stack data platform that gives every actor in an airport development zone — the airport operator, developers, the municipality, and the grid operator — a shared, role-specific view of the same underlying data: land approval status, energy capacity, and the development pipeline.

Built as a portfolio project demonstrating a Python/FastAPI backend with pandas-based analytics, a typed React frontend, JWT authentication with role-based access control, and a containerised deployment setup.

> This project is a working prototype inspired by a real strategic case study (BER+, the development initiative around Berlin Brandenburg Airport). All data is synthetic.

---

## Why this exists

In a multi-stakeholder development zone, every organisation holds a different piece of the picture:

- The **municipality** knows which land parcels are approved, pending, or blocked.
- The **grid operator** knows real substation capacity — and which "reserved" capacity is actually phantom (reservations for projects that never broke ground).
- **Developers** know their own project pipelines but not each other's.
- The **airport operator (FBB)** knows incoming tenant demand but can't match it to available land or energy capacity without the other three.

This platform combines those four data sources into one system, and serves each actor a dashboard built from their own perspective — using the same underlying data.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI |
| Database | PostgreSQL (SQLite for local dev without Docker) |
| ORM | SQLAlchemy |
| Analytics | pandas |
| Auth | JWT (python-jose) + bcrypt |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| API client | Axios |
| Containerisation | Docker, Docker Compose |
| CI | GitHub Actions |

---

## Architecture

```
ber-platform/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app + router registration
│   │   ├── database.py        SQLAlchemy engine/session
│   │   ├── models.py           ORM models (User, BPlan, EnergyRecord, ...)
│   │   ├── schemas.py          Pydantic request/response schemas
│   │   ├── auth.py             JWT auth + role-based dependencies
│   │   ├── seed.py             Seed script — demo users + sample data
│   │   ├── routers/
│   │   │   ├── auth_router.py
│   │   │   ├── dashboard.py     Role-aware overview endpoint
│   │   │   ├── bplans.py
│   │   │   ├── energy.py
│   │   │   └── pipeline.py
│   │   └── services/
│   │       └── analytics.py    pandas-based analytics (capacity, funnels, forecasts)
│   ├── smoke_test.py           End-to-end API test (no server needed — TestClient)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.ts       Axios client + typed API calls
│   │   ├── components/         Shared UI (MetricCard, DataTable, CapacityBar, ...)
│   │   ├── pages/               LoginPage + 4 role dashboards
│   │   ├── types/               Shared TypeScript types
│   │   └── App.tsx              Routing + role-based dashboard selection
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Running locally with Docker (recommended)

```bash
git clone <your-repo-url>
cd ber-platform
docker-compose up --build
```

- Backend API: http://localhost:8000 (Swagger docs at `/docs`)
- Frontend: http://localhost:5173

The backend container automatically seeds the database on first run.

---

## Running locally without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -m app.seed               # creates ber.db with demo data
uvicorn app.main:app --reload    # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL=http://localhost:8000
npm run dev                       # http://localhost:5173
```

---

## Demo accounts

All passwords: `demo1234`

| Role | Email | Organisation | Sees |
|---|---|---|---|
| FBB (Airport Operator) | `fbb@ber-plus.de` | FBB | Zone-wide overview, tenant pipeline, energy demand forecast |
| Developer | `developer@ber-plus.de` | SEGRO | Own B-Plans only, own tenant pipeline, zone capacity context |
| Municipality | `municipality@ber-plus.de` | WFG Dahme-Spreewald | Pending approvals ranked by investment value at stake |
| Grid Operator | `grid@ber-plus.de` | e.dis Netz | Substation capacity, phantom reservation analysis, §42c energy community status |

---

## API overview

Interactive docs are auto-generated at `/docs` (Swagger UI) and `/redoc`.

| Endpoint | Description | Access |
|---|---|---|
| `POST /auth/register` | Create a new user | Public |
| `POST /auth/login` | Get a JWT access token | Public |
| `GET /dashboard/overview` | Role-specific summary metrics + insights | Authenticated |
| `GET /bplans/` | B-Plan list (filtered for developers) | Authenticated |
| `GET /bplans/funnel` | Zone-wide B-Plan status breakdown | Authenticated |
| `GET /bplans/investment-impact` | Investment waiting on pending approvals | Municipality, FBB |
| `GET /energy/capacity` | Zone-wide energy capacity summary | Authenticated |
| `GET /energy/substations` | Per-substation breakdown | Authenticated |
| `GET /energy/phantom-insight` | Phantom reservation analysis | Grid operator, FBB, Developer |
| `GET /energy/demand-forecast` | Demand by quarter from pipeline | Authenticated |
| `GET /energy/energy-community` | §42c EnWG signup status | Authenticated |
| `GET /pipeline/` | Tenant pipeline (filtered for developers) | Authenticated |
| `GET /pipeline/summary` | Pipeline breakdown by status | Authenticated |

### Role-based access control

Routes use FastAPI dependencies to enforce role checks at the endpoint level:

```python
@router.get("/investment-impact")
def get_investment_impact(
    current_user: models.User = Depends(auth.require_role("municipality", "fbb")),
):
    ...
```

A developer calling this endpoint receives `403 Forbidden`. Verified in `smoke_test.py`.

---

## Analytics layer

All derived metrics are computed with pandas in `app/services/analytics.py`, including:

- **Zone capacity summary** — aggregates total/in-use/reserved/available MW across substations
- **Phantom reservation insight** — identifies capacity that is "reserved" but unused, and how many pipeline companies it would unblock if released
- **B-Plan funnel** — approved/pending/blocked breakdown by area and investment value
- **Investment impact** — ranks pending approvals by the investment value waiting on each decision
- **Demand forecast** — cumulative energy demand by quarter from the confirmed pipeline

---

## Testing

```bash
cd backend
python smoke_test.py
```

This runs an end-to-end test across all endpoints using FastAPI's `TestClient` — no running server required. It covers login for all 4 roles, role-based data filtering, and access control (403 on unauthorised routes).

---

## Deployment

- **Backend** → Render.com (or any Docker host). Set `DATABASE_URL` to a managed Postgres instance and `SECRET_KEY` to a random secret.
- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL.

---

## License

MIT
