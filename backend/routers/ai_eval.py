from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..core.config import settings
from ..models.models import User, AiEval
from ..schemas.schemas import AiEvalRequest, AiEvalResult, AiEvalOut
from .auth import get_current_user
import json

router = APIRouter(prefix="/ai-eval", tags=["ai"])

SYSTEM_PROMPT = """당신은 대한민국 대학 입시 전문 컨설턴트입니다.
학생부 세특, 자기소개서 등의 텍스트를 분석하여 학생부종합전형 관점에서 평가합니다.

평가 기준:
- 학업역량 (35%): 내신 성취도, 학업 태도, 지적 호기심, 탐구 능력
- 진로일관성 (25%): 희망 진로와 활동의 연계성, 목적의식
- 공동체역량 (20%): 리더십, 협업, 봉사, 배려
- 성장가능성 (20%): 변화·발전 양상, 도전 정신, 자기성찰

반드시 아래 JSON 형식으로만 응답하세요. 추가 설명 없이 JSON만 출력합니다:
{
  "academic": 0~100점,
  "career": 0~100점,
  "community": 0~100점,
  "growth": 0~100점,
  "total": 0~100점 (가중 평균),
  "summary": "한 줄 종합 평가 (50자 이내)",
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["보완점1", "보완점2", "보완점3"],
  "recommended_majors": ["추천학과1", "추천학과2", "추천학과3"]
}"""


async def call_claude(text: str, target_major: str | None) -> AiEvalResult:
    """Claude API 호출 — API 키 없을 시 더미 결과 반환"""
    if not settings.ANTHROPIC_API_KEY:
        # 개발 모드: 더미 결과
        return AiEvalResult(
            academic=78.0, career=72.0, community=68.0, growth=75.0,
            total=73.6,
            summary="전반적으로 학업역량이 우수하며 진로 방향성이 뚜렷합니다.",
            strengths=["수학·과학 교과 세특의 깊이 있는 탐구 활동", "일관된 이공계 진로 방향성", "동아리·봉사 활동을 통한 협업 경험"],
            improvements=["인문사회 분야 독서 및 활동 보완 필요", "자기소개서의 구체적 사례 추가 권장", "리더십 경험 더 부각 필요"],
            recommended_majors=["컴퓨터공학", "전기전자공학", "소프트웨어학"],
        )

    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    user_msg = f"다음 학생의 학생부/자소서를 평가해 주세요.\n"
    if target_major:
        user_msg += f"희망 학과: {target_major}\n\n"
    user_msg += f"[학생부/자소서 내용]\n{text[:3000]}"  # 최대 3000자

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = message.content[0].text.strip()
    # JSON 추출
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw)
    return AiEvalResult(**data)


@router.post("/", response_model=AiEvalOut, status_code=201)
async def evaluate(
    body: AiEvalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Pro 플랜 체크 (월 3회 무료, 이후 Pro 필요)
    if not user.is_pro:
        from sqlalchemy import func
        from datetime import datetime, timezone, timedelta
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0)
        from sqlalchemy import select as sel
        count_result = await db.execute(
            sel(func.count(AiEval.id))
            .where(AiEval.user_id == user.id, AiEval.created_at >= month_start)
        )
        count = count_result.scalar() or 0
        if count >= 3:
            raise HTTPException(
                status_code=403,
                detail="무료 플랜은 월 3회까지 이용 가능합니다. Pro 플랜으로 업그레이드해 주세요."
            )

    result = await call_claude(body.input_text, body.target_major)

    eval_record = AiEval(
        user_id=user.id,
        student_id=body.student_id,
        input_text=body.input_text[:500],  # DB에는 500자만 저장
        result=result.model_dump(),
    )
    db.add(eval_record)
    await db.flush()
    return {"id": eval_record.id, "result": result, "created_at": eval_record.created_at}


@router.get("/history", response_model=list[AiEvalOut])
async def eval_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    result = await db.execute(
        select(AiEval)
        .where(AiEval.user_id == user.id)
        .order_by(AiEval.created_at.desc())
        .limit(20)
    )
    rows = result.scalars().all()
    return [{"id": r.id, "result": AiEvalResult(**r.result), "created_at": r.created_at} for r in rows]
