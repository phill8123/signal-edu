from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id:         Mapped[int]  = mapped_column(Integer, primary_key=True)
    email:      Mapped[str]  = mapped_column(String(255), unique=True, index=True)
    name:       Mapped[str]  = mapped_column(String(100), default="")
    hashed_pw:  Mapped[str]  = mapped_column(String(255), default="")
    is_pro:     Mapped[bool] = mapped_column(Boolean, default=False)
    plan:       Mapped[str]  = mapped_column(String(20), default="free")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    students:  Mapped[list["Student"]]  = relationship(back_populates="user", cascade="all, delete-orphan")
    ai_evals:  Mapped[list["AiEval"]]   = relationship(back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    """학생 프로파일 — 사용자 1명이 여러 학생 관리 가능 (학원·학교 선생님 등)"""
    __tablename__ = "students"

    id:         Mapped[int]   = mapped_column(Integer, primary_key=True)
    user_id:    Mapped[int]   = mapped_column(ForeignKey("users.id"), index=True)
    name:       Mapped[str]   = mapped_column(String(50))
    grade_type: Mapped[str]   = mapped_column(String(10), default="이과")   # 이과·문과
    my_grade:   Mapped[float] = mapped_column(Float, default=2.0)           # 내신 등급
    selected_ids: Mapped[list] = mapped_column(JSON, default=list)           # 선택 전형 id[]
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="students")


class Major(Base):
    """전형 DB"""
    __tablename__ = "majors"

    id:         Mapped[str]   = mapped_column(String(20), primary_key=True)   # 's01', 'y03' 등
    univ:       Mapped[str]   = mapped_column(String(20), index=True)
    jt:         Mapped[str]   = mapped_column(String(10))                      # 종합·교과
    jeon:       Mapped[str]   = mapped_column(String(100))
    major:      Mapped[str]   = mapped_column(String(100))
    gye:        Mapped[str]   = mapped_column(String(10))                      # 이과·문과·의약·통합
    cat:        Mapped[str]   = mapped_column(String(20))                      # 학과 대분류
    경쟁률:     Mapped[float] = mapped_column(Float)
    g50:        Mapped[float | None] = mapped_column(Float, nullable=True)
    g70:        Mapped[float | None] = mapped_column(Float, nullable=True)
    year:       Mapped[int]   = mapped_column(Integer, default=2025)


class YearDetail(Base):
    """연도별 상세 입시결과"""
    __tablename__ = "year_details"

    id:          Mapped[int]   = mapped_column(Integer, primary_key=True)
    major_id:    Mapped[str]   = mapped_column(ForeignKey("majors.id"), index=True)
    yr:          Mapped[int]   = mapped_column(Integer)
    모집:        Mapped[int]   = mapped_column(Integer)
    충원:        Mapped[int]   = mapped_column(Integer)
    경쟁률:      Mapped[float] = mapped_column(Float)
    g50:         Mapped[float | None] = mapped_column(Float, nullable=True)
    g70:         Mapped[float | None] = mapped_column(Float, nullable=True)
    환산50:      Mapped[float | None] = mapped_column(Float, nullable=True)
    환산70:      Mapped[float | None] = mapped_column(Float, nullable=True)


class AiEval(Base):
    """AI 학종 평가 결과 저장"""
    __tablename__ = "ai_evals"

    id:          Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id:     Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    student_id:  Mapped[int | None] = mapped_column(ForeignKey("students.id"), nullable=True)
    input_text:  Mapped[str] = mapped_column(Text)    # 학생부 / 자소서 입력
    result:      Mapped[dict] = mapped_column(JSON)   # 평가 결과 JSON
    created_at:  Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="ai_evals")


class Payment(Base):
    """결제 내역"""
    __tablename__ = "payments"

    id:          Mapped[int]  = mapped_column(Integer, primary_key=True)
    user_id:     Mapped[int]  = mapped_column(ForeignKey("users.id"), index=True)
    order_id:    Mapped[str]  = mapped_column(String(100), unique=True)
    payment_key: Mapped[str]  = mapped_column(String(200))
    plan:        Mapped[str]  = mapped_column(String(20))   # pro | premium
    amount:      Mapped[int]  = mapped_column(Integer)
    status:      Mapped[str]  = mapped_column(String(20), default="paid")
    created_at:  Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
