from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    is_pro: bool

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    is_pro: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Student ───────────────────────────────
class StudentCreate(BaseModel):
    name: str
    grade_type: str = "이과"
    my_grade: float = 2.0

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    grade_type: Optional[str] = None
    my_grade: Optional[float] = None
    selected_ids: Optional[list[str]] = None

class StudentOut(BaseModel):
    id: int
    name: str
    grade_type: str
    my_grade: float
    selected_ids: list[str]
    updated_at: datetime
    model_config = {"from_attributes": True}


# ── Major ─────────────────────────────────
class MajorOut(BaseModel):
    id: str
    univ: str
    jt: str
    jeon: str
    major: str
    gye: str
    cat: str
    경쟁률: float
    g50: Optional[float]
    g70: Optional[float]
    year: int
    model_config = {"from_attributes": True}

class YearDetailOut(BaseModel):
    yr: int
    모집: int
    충원: int
    경쟁률: float
    g50: Optional[float]
    g70: Optional[float]
    환산50: Optional[float]
    환산70: Optional[float]
    model_config = {"from_attributes": True}

class MajorDetailOut(MajorOut):
    year_details: list[YearDetailOut] = []


# ── AI 평가 ───────────────────────────────
class AiEvalRequest(BaseModel):
    input_text: str           # 학생부 세특 / 자소서 텍스트
    target_major: Optional[str] = None   # 희망 학과
    student_id: Optional[int] = None

class AiEvalResult(BaseModel):
    academic:    float    # 학업역량 (0~100)
    career:      float    # 진로일관성 (0~100)
    community:   float    # 공동체역량 (0~100)
    growth:      float    # 성장가능성 (0~100)
    total:       float    # 종합점수
    summary:     str      # 한 줄 요약
    strengths:   list[str]  # 강점 3가지
    improvements: list[str] # 보완점 3가지
    recommended_majors: list[str]  # 추천 학과

class AiEvalOut(BaseModel):
    id: int
    result: AiEvalResult
    created_at: datetime
    model_config = {"from_attributes": True}
