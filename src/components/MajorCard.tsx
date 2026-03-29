import type { Major } from '../types'
import { useStore } from '../hooks/useStore'
import { getPoss, POSS_LABEL, POSS_BADGE, POSS_BAR_COLOR, gradeColor, catLabel, gyeBadgeClass, gyeLabel } from '../hooks/usePoss'
import { UNIV_COLOR } from '../data/db'

interface Props { d: Major; idx: number }

export default function MajorCard({ d, idx }: Props) {
  const { myGrade, selected, toggleSelected, openDetail } = useStore()
  const poss     = getPoss(d, myGrade)
  const isSel    = selected.includes(d.id)
  const isDis    = !isSel && selected.length >= 10

  const g50t = d.g50 ? d.g50.toFixed(2) : '—'
  const g70t = d.g70 ? d.g70.toFixed(2) : d.g50 ? `≈${d.g50.toFixed(2)}` : '—'

  return (
    <div
      onClick={() => !isDis && toggleSelected(d.id)}
      className={`relative bg-white rounded-xl border-[1.5px] cursor-pointer transition-all select-none overflow-hidden
        ${isSel ? 'border-blue-500 bg-blue-50' : isDis ? 'border-gray-200 opacity-40 cursor-not-allowed' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
    >
      {/* 왼쪽 가능성 세로 바 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
           style={{ background: POSS_BAR_COLOR[poss] }} />

      {/* 선택 순서 번호 */}
      {isSel && (
        <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-blue-600 text-white
                        text-[10px] font-bold flex items-center justify-center z-10">
          {selected.indexOf(d.id) + 1}
        </div>
      )}

      <div className="pl-3 pr-3 pt-2.5 pb-0">
        {/* 단과대 + 계열 배지 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] text-gray-400">{catLabel(d.cat)}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gyeBadgeClass(d.gye)}`}>
            {gyeLabel(d.gye)}
          </span>
        </div>
        <div className="h-px bg-gray-100 mb-2" />

        {/* 학과명 + 대학·전형 */}
        <div className="flex items-start gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full mt-[5px] flex-shrink-0"
               style={{ background: UNIV_COLOR[d.univ] }} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold leading-tight">{d.major}</div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                {d.univ}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                {d.jt} · {d.jeon}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${POSS_BADGE[poss]}`}>
                {POSS_LABEL[poss]}
              </span>
            </div>
          </div>
        </div>

        {/* 통계 3칸 */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {[
            { lbl: '경쟁률', val: `${d.경쟁률.toFixed(1)}:1`, cls: 'text-gray-700' },
            { lbl: '50%컷',  val: g50t, cls: gradeColor(d.g50) },
            { lbl: '70%컷',  val: g70t, cls: gradeColor(d.g70 ?? d.g50) },
          ].map(({ lbl, val, cls }) => (
            <div key={lbl} className="bg-gray-50 rounded-md p-1.5 text-center">
              <div className="text-[9px] text-gray-400 mb-0.5">{lbl}</div>
              <div className={`text-[13px] font-bold ${cls}`}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 상세보기 버튼 */}
      <div className="flex justify-end px-3 py-1.5 border-t border-gray-100">
        <button
          onClick={e => { e.stopPropagation(); openDetail(d.id) }}
          className="text-[10px] px-2 py-1 rounded-full border border-gray-300 text-gray-500
                     hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
        >
          상세보기 ▸
        </button>
      </div>
    </div>
  )
}
