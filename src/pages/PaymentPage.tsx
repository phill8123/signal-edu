import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY ?? 'test_ck_placeholder'

const PLANS = {
  pro: {
    name: 'Pro',
    price: 9900,
    features: ['전 대학 DB 접근', 'AI 학종 평가 무제한', '4개년 상세 분석', '지원 전략 PDF 리포트'],
    color: '#1a3a6b',
  },
  premium: {
    name: 'Premium',
    price: 29900,
    features: ['Pro 모든 기능', 'AI 모의면접 무제한', '전문 컨설턴트 1:1 매칭', '수시·정시 통합 전략'],
    color: '#7c3aed',
  },
} as const

function generateOrderId() {
  return `signal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function PaymentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const planKey = (params.get('plan') ?? 'pro') as 'pro' | 'premium'
  const plan = PLANS[planKey] ?? PLANS.pro

  const [step,    setStep]    = useState<'select' | 'pay' | 'success' | 'fail'>('select')
  const [loading, setLoading] = useState(false)
  const [errMsg,  setErrMsg]  = useState('')

  // 결제 성공 콜백 처리 (토스가 ?paymentKey=&orderId=&amount= 붙여서 리다이렉트)
  useEffect(() => {
    const paymentKey = params.get('paymentKey')
    const orderId    = params.get('orderId')
    const amount     = params.get('amount')
    if (paymentKey && orderId && amount) {
      confirmPayment(paymentKey, orderId, parseInt(amount))
    }
    if (params.get('code')) {
      setErrMsg(params.get('message') ?? '결제가 취소되었습니다.')
      setStep('fail')
    }
  }, [])

  async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    setLoading(true)
    try {
      await api.payments.confirm(paymentKey, orderId, amount, planKey)
      setStep('success')
    } catch (e: any) {
      setErrMsg(e.message)
      setStep('fail')
    } finally {
      setLoading(false)
    }
  }

  async function startPayment() {
    if (!user) { navigate('/login'); return }

    // 토스페이먼츠 SDK 동적 로드
    setLoading(true)
    try {
      // SDK가 없으면 스크립트 태그로 삽입
      if (!(window as any).TossPayments) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://js.tosspayments.com/v2/standard'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('토스 SDK 로드 실패'))
          document.head.appendChild(s)
        })
      }

      const toss = (window as any).TossPayments(TOSS_CLIENT_KEY)
      const orderId = generateOrderId()

      await toss.requestPayment('카드', {
        amount:       plan.price,
        orderId,
        orderName:    `SIGnAL EDU ${plan.name} 플랜`,
        customerName: user.name ?? user.email,
        successUrl:   `${window.location.origin}/payment?plan=${planKey}`,
        failUrl:      `${window.location.origin}/payment?plan=${planKey}&fail=1`,
      })
    } catch (e: any) {
      // 사용자가 취소한 경우 등
      if (e?.code !== 'USER_CANCEL') {
        setErrMsg(e?.message ?? '결제 초기화 실패')
        setStep('fail')
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h2 className="text-xl font-bold mb-2">{plan.name} 플랜 시작!</h2>
        <p className="text-gray-500 text-sm mb-6">
          결제가 완료되었습니다.<br />이제 모든 기능을 자유롭게 이용하세요.
        </p>
        <Link to="/simulator"
          className="block w-full py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold hover:bg-[#152e57] transition-colors">
          시뮬레이터 시작하기 →
        </Link>
      </div>
    </div>
  )

  if (step === 'fail') return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✕</div>
        <h2 className="text-xl font-bold mb-2">결제 실패</h2>
        <p className="text-gray-500 text-sm mb-6">{errMsg || '결제 중 오류가 발생했습니다.'}</p>
        <button onClick={() => setStep('select')}
          className="block w-full py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold hover:bg-[#152e57] transition-colors mb-2">
          다시 시도
        </button>
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">취소하고 돌아가기</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-3">
        <Link to="/" className="text-base font-bold">
          <span className="text-[#1a3a6b]">SIGnAL</span><span className="text-gray-800"> EDU</span>
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-[13px] text-gray-500">플랜 업그레이드</span>
      </header>

      <div className="max-w-lg mx-auto px-5 py-10">
        {/* 플랜 선택 탭 */}
        <div className="flex gap-2 mb-6">
          {(['pro', 'premium'] as const).map(p => (
            <Link key={p} to={`/payment?plan=${p}`}
              className={`flex-1 text-center py-3 rounded-xl text-sm font-semibold border-2 transition-all
                ${planKey === p ? 'border-[#1a3a6b] bg-[#1a3a6b] text-white' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
              {PLANS[p].name}
            </Link>
          ))}
        </div>

        {/* 결제 카드 */}
        <div className="bg-white rounded-2xl border-2 border-[#1a3a6b] p-6 mb-5">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-1">{plan.name} 플랜</div>
              <div className="text-3xl font-bold">{plan.price.toLocaleString()}원<span className="text-base text-gray-400 font-normal">/월</span></div>
            </div>
            <span className="px-3 py-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-full text-xs font-semibold">첫 달 무료</span>
          </div>
          <ul className="space-y-2.5 mb-6">
            {plan.features.map(f => (
              <li key={f} className="flex gap-2 text-sm text-gray-600">
                <span className="text-green-500 flex-shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
          <button onClick={startPayment} disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
            style={{ background: plan.color }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </span>
            ) : `${plan.price.toLocaleString()}원 결제하기 (토스페이먼츠)`}
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">언제든지 구독 취소 가능 · 자동 갱신</p>
          <p className="text-xs text-gray-400">결제는 토스페이먼츠를 통해 안전하게 처리됩니다</p>
        </div>
      </div>
    </div>
  )
}
