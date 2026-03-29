import { useStore } from '../hooks/useStore'
import { getPoss, POSS_LABEL, POSS_BADGE, gradeColor } from '../hooks/usePoss'
import { DB, UNIV_COLOR } from '../data/db'
import type { Poss } from '../types'

const MAX = 10
const LEGAL = 6

export default function RightPanel() {
  const { studentId, myGrade, selected, removeSelected, clearSelected, saveCurrentStudent } = useStore()

  const n = selected.length
  const pct = Math.round((n / MAX) * 100)
  const barColor = n > LEGAL ? 'bg-red-500' : n >= LEGAL ? 'bg-amber-500' : 'bg-blue-600'

  const cnts: Record<Poss, number> = { safe:0, fit:0, bold:0, try:0, na:0 }
  selected.forEach(id => {
    const d = DB.find(x => x.id === id)
    if (d) cnts[getPoss(d, myGrade)]++
  })

  const univs = [...new Set(selected.map(id => DB.find(x => x.id === id)?.univ).filter(Boolean))]
  const jts   = selected.map(id => DB.find(x => x.id === id)?.jt).filter(Boolean)
  const grades = selected.map(id => DB.find(x => x.id === id))
    .filter(d => d && (d.g70 || d.g50)).map(d => d!.g70 ?? d!.g50!) 
  const avgG = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : '—'

  return (
    <aside className="w-[420px] bg-white border-l border-gray-200 flex flex-col text-sm">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-[14px] font-bold">지원 목록</h2>
          <span className="text-xs text-gray-400" id="stuNameDisp" />
        </div>
        <div className="text-[11px] text-gray-400 mb-2">클릭으로 선택 · 최대 10개 · 수시 실제 6장</div>
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>{n} / {MAX} 선택</span>
            {n > LEGAL && <span className="text-red-500">⚠ 실제 수시는 6개까지</span>}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* 선택 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {n === 0 && (
          <div className="text-center py-10 text-gray-400 text-xs leading-relaxed">
            아직 선택한 전형이 없어요.<br />왼쪽 카드를 클릭해 추가하세요.
          </div>
        )}

        {n > LEGAL && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
            실제 수시는 6장까지입니다. 현재 {n}개 선택됨.
          </div>
        )}
        {n >= 4 && n <= LEGAL && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
            수시 {n}장 구성 완료 (최대 {LEGAL}장)
          </div>
        )}

        {selected.map((id, i) => {
          const d = DB.find(x => x.id === id)
          if (!d) return null
          const poss = getPoss(d, myGrade)
          const g70t = d.g70 ? `${d.g70.toFixed(2)}등급` : d.g50 ? `≈${d.g50.toFixed(2)}` : '—'
          return (
            <div key={id} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{d.major}</div>
                <div className="text-[11px] mt-0.5">
                  <span className="font-semibold" style={{ color: UNIV_COLOR[d.univ] }}>{d.univ}</span>
                  <span className="text-gray-400"> · {d.jt} · {d.jeon}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${POSS_BADGE[poss]}`}>
                    {POSS_LABEL[poss]}
                  </span>
                  <span className="text-[10px] text-gray-400">경쟁률 {d.경쟁률.toFixed(1)}</span>
                  <span className={`text-xs font-bold ml-auto ${gradeColor(d.g70 ?? d.g50)}`}>
                    70%컷 {g70t}
                  </span>
                </div>
              </div>
              <button onClick={() => removeSelected(id)}
                className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 text-gray-400 text-xs
                           flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex-shrink-0">
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* 분석 + 버튼 */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        {n > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 text-gray-600">
            <div className="flex justify-between"><span>선택 대학</span><span className="font-semibold">{univs.join(' · ')}</span></div>
            <div className="flex justify-between"><span>종합/교과</span><span className="font-semibold">{jts.filter(j=>j==='종합').length}장 / {jts.filter(j=>j==='교과').length}장</span></div>
            <div className="flex justify-between"><span>평균 70%컷</span><span className="font-semibold">{avgG}{avgG !== '—' ? '등급' : ''}</span></div>
            <div className="flex flex-wrap gap-1 pt-1">
              {(Object.entries(cnts) as [Poss, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                <span key={k} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${POSS_BADGE[k]}`}>
                  {POSS_LABEL[k]} {v}
                </span>
              ))}
            </div>
          </div>
        )}
        <button onClick={saveCurrentStudent}
          className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors">
          저장
        </button>
        <button onClick={clearAll}
          className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors">
          전체 초기화
        </button>
      </div>
    </aside>
  )

  function clearAll() { clearSelected() }
}
