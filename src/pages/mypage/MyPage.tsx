import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../hooks/useStore'
import { DB, STUDENTS } from '../../data/db'
import { getPoss, POSS_BADGE, POSS_LABEL, gradeColor } from '../../hooks/usePoss'

const PLAN_FEATURES = {
  free:    ['수시·정시 시뮬레이터', 'AI 학종 평가 월 3회', '기본 DB (SKY)'],
  pro:     ['전 대학 DB 접근', 'AI 학종 평가 무제한', '지원 전략 PDF 리포트', '4개년 상세 분석'],
  premium: ['AI 모의면접 무제한', '전문 컨설턴트 1:1', '수시·정시 통합 전략'],
}

function GradeInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-bold text-[#1a3a6b]">{value.toFixed(1)}등급</span>
      </div>
      <input type="range" min="1.0" max="5.0" step="0.1" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#1a3a6b]" />
      <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
        <span>1.0</span><span>2.0</span><span>3.0</span><span>4.0</span><span>5.0</span>
      </div>
    </div>
  )
}

export default function MyPage() {
  const { user, signOut } = useAuth()
  const { studentId, myGrade, selected, setStudent, setMyGrade, saveCurrentStudent } = useStore()
  const [tab, setTab] = useState<'profile' | 'selections' | 'plan'>('profile')

  const curStudent = STUDENTS.find(s => s.id === studentId)

  // 모의 성적 (실제로는 DB에서)
  const [grades, setGrades] = useState({
    국어: 1.8, 수학: 2.0, 영어: 1.5, 과학1: 2.2, 과학2: 2.1, 사회: 2.5,
  })
  const avg = Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-3">
        <Link to="/" className="text-base font-bold">
          <span className="text-[#1a3a6b]">SIGnAL</span><span className="text-gray-800"> EDU</span>
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-[13px] text-gray-500">마이페이지</span>
        <div className="ml-auto flex gap-2">
          <Link to="/simulator" className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">시뮬레이터</Link>
          <button onClick={signOut} className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700">로그아웃</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {/* 사용자 헤더 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-xl font-bold text-[#1a3a6b]">
            {(user?.name ?? '?').slice(0, 1)}
          </div>
          <div className="flex-1">
            <div className="font-bold text-base">{user?.name ?? '게스트'}</div>
            <div className="text-sm text-gray-400">{user?.email ?? '로그인 없이 사용 중'}</div>
          </div>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            Free 플랜
          </span>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5 w-fit">
          {([['profile','내 성적 관리'], ['selections','지원 목록'], ['plan','플랜 업그레이드']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* 내 성적 관리 */}
        {tab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">학생 선택</h3>
                <select value={studentId} onChange={e => setStudent(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none">
                  {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="h-px bg-gray-100" />
              <GradeInput label="내신 종합 등급" value={myGrade}
                onChange={v => { setMyGrade(v); setGrades(g => ({ ...g })) }} />
              <div className="h-px bg-gray-100" />
              <h3 className="text-sm font-bold">과목별 등급 입력</h3>
              {Object.entries(grades).map(([subj, g]) => (
                <GradeInput key={subj} label={subj} value={g}
                  onChange={v => setGrades(prev => ({ ...prev, [subj]: v }))} />
              ))}
              <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">가중평균 (6과목)</span>
                <span className="text-xl font-bold text-[#1a3a6b]">{avg.toFixed(2)}등급</span>
              </div>
              <button onClick={saveCurrentStudent}
                className="w-full py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold hover:bg-[#152e57] transition-colors">
                저장
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold mb-3">이수 계열</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['이과', '문과'] as const).map(g => (
                    <button key={g}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all
                        ${curStudent?.grade === myGrade && g === '이과' ? 'border-[#1a3a6b] bg-[#1a3a6b]/5 text-[#1a3a6b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold mb-3">빠른 이동</h3>
                <div className="space-y-2">
                  {[
                    { to: '/simulator', label: '수시 지원 시뮬레이터', desc: '내신 기반 전형 분류' },
                    { to: '/jeongsi',  label: '정시 수능 계산기',    desc: '수능 환산점수 계산' },
                    { to: '/ai-eval',  label: 'AI 학종 평가',        desc: '자소서 적합도 분석' },
                    { to: '/interview',label: '면접 준비 코칭',      desc: '예상질문 & 모의면접' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#1a3a6b]/30 hover:bg-[#1a3a6b]/5 transition-all group">
                      <div>
                        <div className="text-sm font-medium group-hover:text-[#1a3a6b] transition-colors">{item.label}</div>
                        <div className="text-[11px] text-gray-400">{item.desc}</div>
                      </div>
                      <span className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 지원 목록 */}
        {tab === 'selections' && (
          <div className="space-y-4">
            {STUDENTS.map(stu => {
              // 각 학생의 저장된 선택 (로컬 스토어에서)
              const stuSelected = stu.id === studentId ? selected : []
              if (stuSelected.length === 0) return null
              return (
                <div key={stu.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-sm font-bold text-[#1a3a6b]">
                      {stu.name.slice(0, 1)}
                    </div>
                    <span className="font-semibold">{stu.name}</span>
                    <span className="text-xs text-gray-400">{stu.label.split('·').pop()?.trim()}</span>
                    <span className="ml-auto text-xs text-gray-400">{stuSelected.length}개 선택</span>
                  </div>
                  <div className="space-y-2">
                    {stuSelected.map((id, i) => {
                      const d = DB.find(x => x.id === id)
                      if (!d) return null
                      const poss = getPoss(d, stu.grade)
                      return (
                        <div key={id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <span className="text-sm font-bold text-[#1a3a6b] w-5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{d.major}</div>
                            <div className="text-[11px] text-gray-400">{d.univ} · {d.jeon}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${POSS_BADGE[poss]}`}>
                            {POSS_LABEL[poss]}
                          </span>
                          <span className={`text-xs font-bold ${gradeColor(d.g70 ?? d.g50)}`}>
                            {d.g70?.toFixed(2) ?? d.g50?.toFixed(2) ?? '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {selected.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-400 text-sm">아직 저장된 지원 목록이 없어요.</p>
                <Link to="/simulator" className="mt-3 inline-block text-xs px-4 py-2 bg-[#1a3a6b] text-white rounded-lg">
                  수시 시뮬레이터로 이동 →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 플랜 업그레이드 */}
        {tab === 'plan' && (
          <div className="grid md:grid-cols-3 gap-4">
            {(['free', 'pro', 'premium'] as const).map(plan => {
              const prices: Record<string, string> = { free: '무료', pro: '9,900원/월', premium: '29,900원/월' }
              const names:  Record<string, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' }
              const isCurrent = plan === 'free'
              return (
                <div key={plan} className={`bg-white rounded-2xl border p-5
                  ${plan === 'pro' ? 'border-[#1a3a6b] ring-2 ring-[#1a3a6b]/20' : 'border-gray-200'}`}>
                  {plan === 'pro' && (
                    <div className="text-center mb-3">
                      <span className="bg-[#1a3a6b] text-white text-xs font-semibold px-3 py-1 rounded-full">가장 인기</span>
                    </div>
                  )}
                  <div className="text-xs font-semibold text-gray-400 mb-1">{names[plan]}</div>
                  <div className="text-2xl font-bold mb-4">{prices[plan]}</div>
                  <ul className="space-y-2 mb-5">
                    {PLAN_FEATURES[plan].map(f => (
                      <li key={f} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
                      ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan === 'pro' ? 'bg-[#1a3a6b] text-white hover:bg-[#152e57]'
                        : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                    {isCurrent ? '현재 플랜' : '업그레이드'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
