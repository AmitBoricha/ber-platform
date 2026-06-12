from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services import analytics

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/", response_model=list[schemas.PipelineItemOut])
def list_pipeline(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Role-aware pipeline listing.
    - developer: only companies linked to their own projects
    - everyone else: full zone pipeline
    """
    query = db.query(models.PipelineItem)
    if current_user.role == "developer":
        query = query.filter(models.PipelineItem.developer == current_user.organisation)
    return query.all()


@router.get("/summary")
def get_pipeline_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Pipeline breakdown by status with total energy demand."""
    return analytics.pipeline_summary(db)
