import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type AiEvalResult } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const RADAR_LABELS = [
  { key: 'academic',  label: '학업역량', weight: '35%', color: '#2563eb' },
  { key: 'career',    label: '진로일관성', weight: '25%', color: '#16a34a' },
  { key: 'community', label: '공동체역량', weight: '20%', color: '#d97706' },
  { key: 'growth',    label: '성장가능성', weight: '20%', color: '#9333ea' },
] as const

function ScoreBar({ label, weight, score, color }: { label: string; weight: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-[10px] text-gray-400">({weight})</span>
        </div>
        <span className="text-base font-bold" style={{ color }}>{score.toFixed(0)}점</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

const SAMPLE_TEXT = `[자기소개서 예시 — 직접 입력해 보세요]

1번 문항: 고등학교 재학 기간 중 자신의 진로와 관련하여 어떤 노력을 해왔는지 구체적으로 작성해 주세요.

컴퓨터과학에 관심을 가지게 된 것은 고1 때 알고리즘 수업에서 재귀함수의 아름다움을 경험하면서부터입니다. 
수학적 귀납법과의 연결성을 발견하고, 스스로 피보나치 수열 구현 프로그램을 제작했습니다.
이후 정보올림피아드에 참가해 은상을 수상했고, 교내 AI 동아리 부장으로 GPT 원리를 후배들에게 가르쳤습니다.`

export default function AiEvalPage() {
  const { user } = useAuth()
  const [inputText, setInput] = useState(SAMPLE_TEXT)
  const [targetMajor, setTarget] = useState('컴퓨터공학')
  const [result, setResult]   = useState<AiEvalResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleEval() {
    if (!inputText.trim()) return
    setLoading(true); setError('')
    try {
      const out = await api.aiEval.evaluate(inputText, targetMajor)
      setResult(out.result)
    } catch (e: any) {
      setError(e.message ?? '평가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-3">
        <Link to="/" className="text-base font-bold">
          <span className="text-[#1a3a6b]">SIGnAL</span><span className="text-gray-800"> EDU</span>
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-[13px] text-gray-500">AI 학종 적합도 평가</span>
        <div className="ml-auto flex gap-2">
          <Link to="/simulator" className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">수시 시뮬레이터</Link>
          {!user && <Link to="/login" className="text-xs px-3 py-1.5 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#152e57]">로그인</Link>}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6 grid md:grid-cols-2 gap-5">

        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold mb-3 text-gray-700">희망 학과</h2>
            <input type="text" value={targetMajor} onChange={e => setTarget(e.target.value)}
              placeholder="예: 컴퓨터공학, 의예과, 경영학"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold mb-3 text-gray-700">
              학생부 세특 / 자기소개서 입력
              <span className="text-[11px] text-gray-400 font-normal ml-2">(최대 3,000자)</span>
            </h2>
            <textarea
              value={inputText}
              onChange={e => setInput(e.target.value.slice(0, 3000))}
              rows={14}
              placeholder="학생부 교과 세특, 창체 활동, 자기소개서 내용을 붙여넣어 주세요..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-gray-400">{inputText.length} / 3,000자</span>
              {!user && <span className="text-[11px] text-amber-600">로그인 후 월 3회 무료 이용</span>}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          <button onClick={handleEval} disabled={loading || !inputText.trim()}
            className="w-full py-3.5 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#152e57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Claude AI 분석 중...
              </span>
            ) : 'AI 학종 적합도 평가 시작'}
          </button>

          <div className="text-[11px] text-gray-400 text-center">
            Claude Sonnet 4 기반 분석 · 결과는 참고용입니다
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div>
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                학생부 세특이나 자소서를 왼쪽에<br />
                붙여넣고 평가 버튼을 누르면<br />
                AI가 학종 적합도를 분석해 드립니다.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Claude AI가 분석하고 있어요...</p>
              <p className="text-xs text-gray-400 mt-1">약 10~15초 소요됩니다</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* 종합 점수 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700">종합 적합도 점수</h3>
                  <div className="text-3xl font-bold text-[#1a3a6b]">{result.total.toFixed(0)}<span className="text-base text-gray-400">점</span></div>
                </div>
                <div className="space-y-3">
                  {RADAR_LABELS.map(({ key, label, weight, color }) => (
                    <ScoreBar key={key} label={label} weight={weight} score={result[key]} color={color} />
                  ))}
                </div>
              </div>

              {/* 요약 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 font-medium leading-relaxed">"{result.summary}"</p>
              </div>

              {/* 강점·보완점 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-xs font-bold text-green-700 mb-2">강점</h4>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                        <span className="text-green-500 flex-shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-xs font-bold text-amber-700 mb-2">보완점</h4>
                  <ul className="space-y-1.5">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                        <span className="text-amber-500 flex-shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 추천 학과 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-xs font-bold text-gray-700 mb-2">AI 추천 학과</h4>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_majors.map((m, i) => (
                    <Link key={i} to={`/simulator?q=${encodeURIComponent(m)}`}
                      className="text-xs px-3 py-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-full font-semibold hover:bg-[#1a3a6b]/20 transition-colors">
                      {m} →
                    </Link>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">클릭하면 수시 시뮬레이터에서 해당 학과를 검색합니다</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
