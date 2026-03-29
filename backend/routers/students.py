from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.models import User, Student
from ..schemas.schemas import StudentCreate, StudentUpdate, StudentOut
from .auth import get_current_user

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/", response_model=list[StudentOut])
async def list_students(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == user.id))
    return result.scalars().all()


@router.post("/", response_model=StudentOut, status_code=201)
async def create_student(
    body: StudentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student = Student(user_id=user.id, **body.model_dump())
    db.add(student)
    await db.flush()
    return student


@router.patch("/{student_id}", response_model=StudentOut)
async def update_student(
    student_id: int,
    body: StudentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Student).where(Student.id == student_id, Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="학생을 찾을 수 없습니다")

    for k, v in body.model_dump(exclude_none=True).items():
        setattr(student, k, v)
    return student


@router.delete("/{student_id}", status_code=204)
async def delete_student(
    student_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Student).where(Student.id == student_id, Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="학생을 찾을 수 없습니다")
    await db.delete(student)
