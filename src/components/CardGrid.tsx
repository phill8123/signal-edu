import { useFiltered } from '../hooks/useFiltered'
import { useStore } from '../hooks/useStore'
import { getPoss, POSS_LABEL, POSS_BADGE, POSS_BAR_COLOR, gradeColor, catLabel, gyeBadgeClass, gyeLabel } from '../hooks/usePoss'
import { UNIV_COLOR } from '../data/db'
import MajorCard from './MajorCard'
import type { Major, Poss, SortKey, ViewMode } from '../types'

const SORT_OPTS: { k: SortKey; l: string }[] = [
  { k:'poss',  l:'가능성순' },
  { k:'grade', l:'등급컷 낮은순' },
  { k:'comp',  l:'경쟁률 낮은순' },
  { k:'univ',  l:'대학명순' },
]
const VIEW_OPTS: { m: ViewMode; l: string }[] = [
  { m:'card',  l:'카드' },
  { m:'group', l:'가능성별 그룹' },
  { m:'table', l:'테이블' },
]
const POSS_GROUPS: { key: Poss; desc: string }[] = [
  { key:'safe', desc:'내 등급이 70%컷보다 0.3 이상 유리' },
  { key:'fit',  desc:'70%컷 ±0.3 범위' },
  { key:'bold', desc:'70%컷보다 0.3~0.7 불리' },
  { key:'try',  desc:'70%컷보다 0.7 이상 불리' },
  { key:'na',   desc:'등급컷 데이터 없음' },
]
const POSS_TEXT: Record<Poss, string> = {
  safe:'text-green-700', fit:'text-blue-700', bold:'text-yellow-700', try:'text-red-700', na:'text-gray-500'
}

function SortBtn({ k, active, onClick }: { k: SortKey; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border transition-all
        ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'}`}>
      {SORT_OPTS.find(s => s.k === k)?.l}
    </button>
  )
}
function ViewBtn({ m, active, onClick }: { m: ViewMode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border transition-all
        ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'}`}>
      {VIEW_OPTS.find(v => v.m === m)?.l}
    </button>
  )
}

function TableRow({ d, idx }: { d: Major; idx: number }) {
  const { myGrade, selected, toggleSelected, openDetail } = useStore()
  const poss  = getPoss(d, myGrade)
  const isSel = selected.includes(d.id)
  const isDis = !isSel && selected.length >= 10
  const ref   = d.g70 ?? d.g50
  const diff  = ref != null ? (myGrade - ref).toFixed(2) : '—'
  const diffClr = diff === '—' ? 'text-gray-400'
    : parseFloat(diff) <= -0.3 ? 'text-green-700'
    : parseFloat(diff) <=  0.3 ? 'text-blue-700'
    : parseFloat(diff) <=  0.7 ? 'text-yellow-700'
    : 'text-red-700'

  return (
    <tr onClick={() => !isDis && toggleSelected(d.id)}
      className={`cursor-pointer border-b border-gray-100 transition-colors
        ${isSel ? 'bg-blue-50' : isDis ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
      <td className="p-2 w-8">
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold
          ${isSel ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
          {isSel ? selected.indexOf(d.id) + 1 : ''}
        </div>
      </td>
      <td className="p-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${POSS_BADGE[poss]}`}>{POSS_LABEL[poss]}</span></td>
      <td className="p-2 font-semibold text-sm">{d.major}</td>
      <td className="p-2 text-xs font-semibold" style={{ color: UNIV_COLOR[d.univ] }}>{d.univ}</td>
      <td className="p-2 text-xs text-gray-500">{d.jt}<br/><span className="text-gray-400">{d.jeon}</span></td>
      <td className="p-2 text-xs">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${gyeBadgeClass(d.gye)}`}>{gyeLabel(d.gye)}</span>
        <br/><span className="text-[10px] text-gray-400">{catLabel(d.cat)}</span>
      </td>
      <td className="p-2 text-center text-xs">{d.경쟁률.toFixed(1)}</td>
      <td className={`p-2 text-center text-xs font-bold ${gradeColor(d.g50)}`}>{d.g50 ? d.g50.toFixed(2) : '—'}</td>
      <td className={`p-2 text-center text-xs font-bold ${gradeColor(d.g70 ?? d.g50)}`}>
        {d.g70 ? d.g70.toFixed(2) : d.g50 ? `≈${d.g50.toFixed(2)}` : '—'}
      </td>
      <td className={`p-2 text-center text-xs font-bold ${diffClr}`}>{diff}</td>
      <td className="p-2">
        <button onClick={e => { e.stopPropagation(); openDetail(d.id) }}
          className="text-[10px] px-2 py-0.5 rounded-full border border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-300">
          상세
        </button>
      </td>
    </tr>
  )
}

export default function CardGrid() {
  const { sortKey, viewMode, myGrade, setSortKey, setViewMode } = useStore()
  const filtered = useFiltered()

  return (
    <main className="flex-1 overflow-y-auto p-4">
      {/* 컨트롤 바 */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h2 className="text-[13px] font-semibold">지원 가능 전형 목록</h2>
          <span className="text-[11px] text-gray-400">{filtered.length}개 전형</span>
          <span className="ml-auto text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-semibold">
            내 내신 {myGrade.toFixed(1)}등급 기준
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">정렬</span>
          {SORT_OPTS.map(({ k }) => (
            <SortBtn key={k} k={k} active={sortKey === k} onClick={() => setSortKey(k)} />
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">보기</span>
          {VIEW_OPTS.map(({ m }) => (
            <ViewBtn key={m} m={m} active={viewMode === m} onClick={() => setViewMode(m)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          조건에 맞는 전형이 없습니다.<br />필터를 조정해 보세요.
        </div>
      )}

      {/* 카드 뷰 */}
      {viewMode === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {filtered.map((d, i) => <MajorCard key={d.id} d={d} idx={i} />)}
        </div>
      )}

      {/* 그룹 뷰 */}
      {viewMode === 'group' && filtered.length > 0 && (
        <div>
          {POSS_GROUPS.map(({ key, desc }) => {
            const items = filtered.filter(d => getPoss(d, myGrade) === key)
            if (!items.length) return null
            return (
              <div key={key} className="mb-6">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-gray-200">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${POSS_BADGE[key]}`}>
                    {POSS_LABEL[key]}
                  </span>
                  <span className={`text-xs font-semibold ${POSS_TEXT[key]}`}>{desc}</span>
                  <span className="text-[10px] text-gray-400">{items.length}개</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {items.map((d, i) => <MajorCard key={d.id} d={d} idx={i} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 테이블 뷰 */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['', '가능성', '모집단위', '대학', '전형', '계열', '경쟁률', '50%컷', '70%컷', '내신차이', ''].map((h, i) => (
                    <th key={i} className="p-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                        style={{ width: ['32px','60px','160px','64px','100px','90px','56px','56px','56px','64px','44px'][i] }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => <TableRow key={d.id} d={d} idx={i} />)}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
            내신차이 = 내 등급 − 70%컷 &nbsp;|&nbsp; 음수(-) = 유리 &nbsp;|&nbsp; 행 클릭으로 선택/해제
          </div>
        </div>
      )}
    </main>
  )
}
