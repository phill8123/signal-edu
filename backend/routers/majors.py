from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.models import Major, YearDetail
from ..schemas.schemas import MajorOut, MajorDetailOut

router = APIRouter(prefix="/majors", tags=["majors"])


@router.get("/", response_model=list[MajorOut])
async def list_majors(
    univ: list[str] = Query(default=[]),
    jt:   list[str] = Query(default=[]),
    gye:  list[str] = Query(default=[]),
    cat:  list[str] = Query(default=[]),
    year: int = Query(default=2025),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Major).where(Major.year == year)
    if univ: stmt = stmt.where(Major.univ.in_(univ))
    if jt:   stmt = stmt.where(Major.jt.in_(jt))
    if gye:  stmt = stmt.where(Major.gye.in_(gye))
    if cat:  stmt = stmt.where(Major.cat.in_(cat))

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{major_id}", response_model=MajorDetailOut)
async def get_major(major_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Major).where(Major.id == major_id))
    major = result.scalar_one_or_none()
    if not major:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="전형을 찾을 수 없습니다")

    details = await db.execute(
        select(YearDetail)
        .where(YearDetail.major_id == major_id)
        .order_by(YearDetail.yr.desc())
    )
    major_dict = {c.name: getattr(major, c.name) for c in major.__table__.columns}
    major_dict["year_details"] = details.scalars().all()
    return major_dict
