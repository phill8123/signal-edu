from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone
import httpx
import base64

from ..core.database import get_db
from ..core.config import settings
from ..models.models import User, Payment
from .auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

TOSS_SECRET = getattr(settings, "TOSS_SECRET_KEY", "test_sk_placeholder")
TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm"

PLAN_PRICES = {
    "pro":     9900,
    "premium": 29900,
}


class PaymentConfirmRequest(BaseModel):
    paymentKey: str
    orderId:    str
    amount:     int
    plan:       str   # "pro" | "premium"


class PaymentResponse(BaseModel):
    success:  bool
    plan:     str
    message:  str


@router.post("/confirm", response_model=PaymentResponse)
async def confirm_payment(
    body: PaymentConfirmRequest,
    user: User = Depends(get_current_user),
    db:   AsyncSession = Depends(get_db),
):
    # 금액 검증
    expected = PLAN_PRICES.get(body.plan)
    if not expected:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다")
    if body.amount != expected:
        raise HTTPException(status_code=400, detail="결제 금액이 일치하지 않습니다")

    # 토스페이먼츠 API 호출 (테스트 키일 경우 스킵)
    if not TOSS_SECRET.startswith("test_sk_placeholder"):
        encoded = base64.b64encode(f"{TOSS_SECRET}:".encode()).decode()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                TOSS_CONFIRM_URL,
                headers={"Authorization": f"Basic {encoded}", "Content-Type": "application/json"},
                json={"paymentKey": body.paymentKey, "orderId": body.orderId, "amount": body.amount},
                timeout=10,
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="결제 승인 실패: " + resp.text)

    # DB에 결제 기록 저장
    payment = Payment(
        user_id=user.id,
        order_id=body.orderId,
        payment_key=body.paymentKey,
        plan=body.plan,
        amount=body.amount,
        status="paid",
    )
    db.add(payment)

    # 유저 플랜 업그레이드
    user.is_pro = True
    user.plan = body.plan
    await db.flush()

    return PaymentResponse(success=True, plan=body.plan, message=f"{body.plan.capitalize()} 플랜 업그레이드 완료!")


@router.get("/history")
async def payment_history(
    user: User = Depends(get_current_user),
    db:   AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user.id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return [
        {
            "id":          p.id,
            "plan":        p.plan,
            "amount":      p.amount,
            "status":      p.status,
            "created_at":  p.created_at.isoformat(),
        }
        for p in payments
    ]
