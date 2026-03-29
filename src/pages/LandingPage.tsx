import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: '📊',
    title: '수시 지원 시뮬레이터',
    desc: '내신 등급을 입력하면 안정·적정·소신·도전 전형을 자동으로 분류해 드려요. SKY 82개 전형 수록.',
    badge: '완성',
    badgeCls: 'bg-green-100 text-green-700',
  },
  {
    icon: '🎯',
    title: '정시 수능 환산 계산기',
    desc: '수능 원점수를 입력하면 대학별 환산점수와 합격 가능성을 즉시 계산해 드려요.',
    badge: 'STEP 2',
    badgeCls: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🤖',
    title: 'AI 학종 적합도 평가',
    desc: '학생부·자소서를 분석해 학업역량·진로일관성·공동체역량·성장가능성을 평가하고 적합 학과를 추천해요.',
    badge: 'STEP 3',
    badgeCls: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '🎤',
    title: '면접 준비 코칭',
    desc: '전형별 면접 방식·예상질문 100+와 AI 모의면접 피드백으로 합격률을 높여요.',
    badge: 'STEP 4',
    badgeCls: 'bg-amber-100 text-amber-700',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '무료',
    features: ['수시 시뮬레이터 기본 조회', '내신 등급 합격선 비교', 'SKY 기본 데이터'],
    cta: '무료로 시작',
    ctaCls: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '9,900원',
    period: '/월',
    features: ['전 대학 데이터 접근', '4개년 연도별 상세 분석', 'AI 학종 평가 월 3회', '지원 전략 PDF 리포트'],
    cta: '프로 시작하기',
    ctaCls: 'bg-[#1a3a6b] text-white hover:bg-[#152e57]',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '29,900원',
    period: '/월',
    features: ['AI 학종 평가 무제한', 'AI 모의면접 피드백', '전문 컨설턴트 1:1 매칭', '수시·정시 통합 전략'],
    cta: '프리미엄 시작',
    ctaCls: 'bg-purple-600 text-white hover:bg-purple-700',
    highlight: false,
  },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <div className="text-base font-bold tracking-tight">
            <span className="text-[#1a3a6b]">SIGnAL</span>
            <span className="text-gray-800"> EDU</span>
          </div>
          <div className="hidden md:flex items-center gap-6 ml-6 text-sm text-gray-500">
            <Link to="/simulator" className="hover:text-gray-900 transition-colors">수시 시뮬레이터</Link>
            <Link to="/jeongsi"   className="hover:text-gray-900 transition-colors">정시 계산기</Link>
            <Link to="/interview" className="hover:text-gray-900 transition-colors">면접 코칭</Link>
            <a href="#pricing"     className="hover:text-gray-900 transition-colors">요금제</a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
                <Link to="/simulator"
                  className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-semibold hover:bg-[#152e57] transition-colors">
                  시뮬레이터 열기
                </Link>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  로그인
                </Link>
                <Link to="/login"
                  className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-semibold hover:bg-[#152e57] transition-colors">
                  무료 시작
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          2026 수시 입시결과 DB 업데이트 완료
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
          데이터와 AI로<br />
          <span className="text-[#1a3a6b]">합격 가능성</span>을 높이세요
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          SKY 포함 전국 50개 대학 4개년 입시결과 DB를 바탕으로<br />
          내 내신·수능 성적에 맞는 최적 지원 전략을 AI가 제시합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/simulator"
            className="px-7 py-3.5 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#152e57] transition-colors">
            수시 시뮬레이터 시작 →
          </Link>
          <Link to="/jeongsi"
            className="px-7 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            정시 수능 계산기
          </Link>
        </div>
        {/* 통계 */}
        <div className="flex flex-wrap justify-center gap-8 mt-14">
          {[['82개', 'SKY 전형 수록'], ['4개년', '입시결과 데이터'], ['5단계', '지원가능성 분류'], ['무료', '기본 기능 제공']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-[#1a3a6b]">{n}</div>
              <div className="text-xs text-gray-400 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-center mb-2">SIGnAL EDU의 핵심 기능</h2>
          <p className="text-gray-400 text-sm text-center mb-10">단계별로 출시됩니다</p>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeCls}`}>{f.badge}</span>
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요금제 */}
      <section id="pricing" className="py-16">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-center mb-2">요금제</h2>
          <p className="text-gray-400 text-sm text-center mb-10">모든 플랜 첫 달 무료 체험</p>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div key={p.name}
                className={`rounded-2xl p-6 border ${p.highlight ? 'border-[#1a3a6b] ring-2 ring-[#1a3a6b]/20' : 'border-gray-200'}`}>
                {p.highlight && (
                  <div className="text-center mb-4">
                    <span className="bg-[#1a3a6b] text-white text-xs font-semibold px-3 py-1 rounded-full">가장 인기</span>
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-400 mb-1">{p.name}</div>
                <div className="flex items-baseline gap-0.5 mb-5">
                  <span className="text-3xl font-bold">{p.price}</span>
                  {p.period && <span className="text-gray-400 text-sm">{p.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={p.name === 'Free' ? '/login' : `/payment?plan=${p.name.toLowerCase()}`}
                  className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.ctaCls}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="font-bold text-sm text-gray-600">
            <span className="text-[#1a3a6b]">SIGnAL</span> EDU
          </div>
          <div>© 2026 SIGnAL EDU. 데이터와 AI로 합격 가능성을 높입니다.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600">이용약관</a>
            <a href="#" className="hover:text-gray-600">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
