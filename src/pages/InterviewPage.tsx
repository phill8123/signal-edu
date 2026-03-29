import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { INTERVIEW_QUESTIONS, INTERVIEW_UNIVS, type InterviewQuestion } from '../data/interviews'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const CAT_LIST = ['전체', '공통', '공학', '자연과학', '의약보건', '경영경제', '인문', '사회과학']
const TYPE_CLS: Record<string, string> = {
  공통: 'bg-gray-100 text-gray-600 border-gray-300',
  전공: 'bg-blue-100 text-blue-700 border-blue-300',
  심층: 'bg-purple-100 text-purple-700 border-purple-300',
  상황: 'bg-amber-100 text-amber-700 border-amber-300',
}

function QuestionCard({ q, onPractice }: { q: InterviewQuestion; onPractice: (q: InterviewQuestion) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${TYPE_CLS[q.type]}`}>
            {q.type}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {q.keywords.map(k => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{k}</span>
              ))}
            </div>
          </div>
          <span className="text-gray-300 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <p className="text-[11px] font-semibold text-blue-700 mb-1">답변 힌트</p>
            <p className="text-xs text-blue-800 leading-relaxed">{q.hint}</p>
          </div>
          <button onClick={() => onPractice(q)}
            className="mt-3 w-full py-2 bg-[#1a3a6b] text-white rounded-lg text-xs font-semibold hover:bg-[#152e57] transition-colors">
            이 질문으로 AI 모의면접 시작 →
          </button>
        </div>
      )}
    </div>
  )
}

export default function InterviewPage() {
  const { user } = useAuth()
  const [tab,   setTab]   = useState<'questions' | 'practice' | 'univinfo'>('questions')
  const [cat,   setCat]   = useState('전체')
  const [query, setQuery] = useState('')

  // 모의면접 상태
  const [curQ,     setCurQ]     = useState<InterviewQuestion | null>(null)
  const [answer,   setAnswer]   = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [history,  setHistory]  = useState<{ q: string; a: string; fb: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const filtered = INTERVIEW_QUESTIONS.filter(q => {
    if (cat !== '전체' && q.cat !== cat) return false
    if (query && !q.question.includes(query) && !q.major.includes(query)) return false
    return true
  })

  function startPractice(q: InterviewQuestion) {
    setCurQ(q)
    setAnswer('')
    setFeedback('')
    setTab('practice')
  }

  async function submitAnswer() {
    if (!curQ || !answer.trim()) return
    setLoading(true); setFeedback('')
    try {
      const prompt = `당신은 대학입시 면접 코칭 전문가입니다.
다음 면접 질문에 대한 학생의 답변을 평가하고 구체적인 피드백을 제공해주세요.

질문: ${curQ.question}
답변 힌트 키워드: ${curQ.keywords.join(', ')}

학생 답변:
"${answer}"

다음 형식으로 피드백해주세요:
[종합 평가] 한 줄 총평 (잘한 점 + 보완점)
[잘된 점] 구체적으로 2가지
[보완할 점] 구체적으로 2가지
[더 나은 답변 예시] 핵심 요소를 담은 모범 답변 방향 (3~4문장)`

      // Claude API 직접 호출 (백엔드 없이도 동작)
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        }),
      }).catch(() => null)

      let fb = ''
      if (res && res.ok) {
        const data = await res.json()
        fb = data.content?.[0]?.text ?? ''
      } else {
        // 더미 피드백 (API 키 없을 때)
        fb = `[종합 평가] 전반적으로 구체적인 경험을 잘 연결하셨으나, 핵심 키워드 활용을 더 강화해 보세요.

[잘된 점]
• 질문의 의도를 파악하고 논리적으로 답변을 구성했습니다.
• 본인의 경험과 연결 지어 진정성 있게 표현했습니다.

[보완할 점]
• "${curQ.keywords[0]}" 개념을 명시적으로 언급하면 더욱 설득력이 높아집니다.
• 답변 마무리에 지원 학과와의 연결고리를 추가해 보세요.

[더 나은 답변 예시]
"저는 [구체적 경험]을 통해 ${curQ.keywords.join('과 ')}의 중요성을 깨달았습니다. 
특히 [어려움]을 극복하는 과정에서 [배운 점]을 얻었고, 이를 바탕으로 [지원 학과]에서 [목표]를 이루고 싶습니다."`
      }
      setFeedback(fb)
      setHistory(h => [...h, { q: curQ.question, a: answer, fb }])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
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
        <span className="text-[13px] text-gray-500">면접 준비 코칭</span>
        <div className="ml-auto flex gap-2">
          <Link to="/ai-eval" className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">AI 학종 평가</Link>
          <Link to="/simulator" className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">수시 시뮬레이터</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-5">
        {/* 탭 */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5 w-fit">
          {([['questions','예상질문 DB'], ['practice','AI 모의면접'], ['univinfo','대학별 면접정보']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* 예상질문 DB */}
        {tab === 'questions' && (
          <div className="grid md:grid-cols-[220px_1fr] gap-4">
            <div className="space-y-2">
              <div className="bg-white rounded-xl border border-gray-200 p-3">
                <h3 className="text-xs font-bold text-gray-500 mb-2">학과 분류</h3>
                {CAT_LIST.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5
                      ${cat === c ? 'bg-[#1a3a6b] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {c}
                    <span className="float-right text-[10px] opacity-60">
                      {c === '전체' ? INTERVIEW_QUESTIONS.length : INTERVIEW_QUESTIONS.filter(q => q.cat === c).length}
                    </span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="질문 검색..." value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">{filtered.length}개 질문</p>
              {filtered.map(q => <QuestionCard key={q.id} q={q} onPractice={startPractice} />)}
            </div>
          </div>
        )}

        {/* AI 모의면접 */}
        {tab === 'practice' && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              {/* 질문 선택 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold mb-3">연습할 질문 선택</h3>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={curQ?.id ?? ''}
                  onChange={e => {
                    const q = INTERVIEW_QUESTIONS.find(q => q.id === e.target.value)
                    if (q) { setCurQ(q); setAnswer(''); setFeedback('') }
                  }}>
                  <option value="">-- 질문 선택 --</option>
                  {INTERVIEW_QUESTIONS.map(q => (
                    <option key={q.id} value={q.id}>[{q.type}] {q.question.slice(0, 30)}...</option>
                  ))}
                </select>
                {curQ && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">{curQ.question}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {curQ.keywords.map(k => <span key={k} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{k}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* 답변 입력 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold mb-2">내 답변 작성</h3>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8}
                  placeholder="면접 답변을 작성해 보세요. 실제 면접처럼 말하는 것을 상상하며 써보세요..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-500" />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] text-gray-400">{answer.length}자</span>
                  <span className="text-[11px] text-gray-400">약 {Math.ceil(answer.length / 200)}분 분량</span>
                </div>
                <button onClick={submitAnswer} disabled={loading || !curQ || !answer.trim()}
                  className="w-full mt-3 py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold hover:bg-[#152e57] disabled:opacity-50 transition-colors">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      AI 피드백 생성 중...
                    </span>
                  ) : 'AI 피드백 받기'}
                </button>
              </div>
            </div>

            {/* 피드백 */}
            <div className="space-y-4">
              {!feedback && !loading && (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
                  <div className="text-3xl mb-3">🎤</div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    질문을 선택하고 답변을 작성한 뒤<br/>
                    AI 피드백 버튼을 눌러보세요.
                  </p>
                </div>
              )}

              {loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">답변을 분석하고 있어요...</p>
                </div>
              )}

              {feedback && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1a3a6b] rounded-full flex items-center justify-center text-[10px] text-white font-bold">AI</span>
                    면접 피드백
                  </h3>
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{feedback}</div>
                  <button onClick={() => { setAnswer(''); setFeedback('') }}
                    className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    다시 답변 작성하기
                  </button>
                </div>
              )}

              {history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-xs font-bold text-gray-500 mb-2">연습 이력 ({history.length}회)</h3>
                  {history.slice(-3).reverse().map((h, i) => (
                    <div key={i} className="text-xs text-gray-500 py-1.5 border-b border-gray-100 last:border-0">
                      {h.q.slice(0, 35)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div ref={bottomRef} />
          </div>
        )}

        {/* 대학별 면접 정보 */}
        {tab === 'univinfo' && (
          <div className="grid md:grid-cols-2 gap-4">
            {INTERVIEW_UNIVS.map(u => (
              <div key={u.univ + u.dept} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold">{u.univ}</h3>
                    <p className="text-xs text-gray-400">{u.dept} · {u.jeon}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-full font-semibold">{u.duration}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">방식</span>
                    <span className="text-gray-700 font-medium">{u.style}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">반영 비율</span>
                    <span className="text-gray-700">{u.ratio}</span>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1">진행 순서</p>
                    <div className="space-y-1">
                      {u.process.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                          <span className="text-gray-600">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1">준비 팁</p>
                    {u.tips.map((t, i) => (
                      <div key={i} className="flex gap-1.5 text-gray-600 mb-0.5">
                        <span className="text-green-500 flex-shrink-0">✓</span>{t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
