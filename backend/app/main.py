from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, bplans, energy, pipeline, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BER+ Coordination Intelligence API",
    description=(
        "Role-aware REST API for the BER+ Coordination Intelligence Layer. "
        "Serves zone data (B-Plans, energy capacity, development pipeline) "
        "to FBB, developers, municipalities, and grid operators, "
        "with pandas-powered analytics."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(dashboard.router)
app.include_router(bplans.router)
app.include_router(energy.router)
app.include_router(pipeline.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "message": "BER+ Coordination Intelligence API",
        "docs": "/docs",
    }
