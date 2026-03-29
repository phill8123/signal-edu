import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import GradeComboPanel from './GradeComboPanel'
import type { Gye, Jt, Poss, Cat } from '../types'

// ── 지역별 대학 분류 ──────────────────────────────────────────
import { REGION_UNIVS } from '../data/db'

const ALL_UNIVS_BY_REGION = Object.entries(REGION_UNIVS).flatMap(([,univs]) => univs)

const CAT_LIST: Cat[] = ['공학','자연과학','의약보건','경영경제','인문','사회과학']
const CAT_LABEL: Record<Cat, string> = {
  '공학':'공학','자연과학':'자연','의약보건':'의약·보건','경영경제':'경영·경제','인문':'인문','사회과학':'사회',
}
const POSS_LIST: Poss[] = ['safe','fit','bold','try','na']
const POSS_LABEL: Record<Poss, string> = { safe:'안정', fit:'적정', bold:'소신', try:'도전', na:'미공개' }
const POSS_CLS: Record<Poss, string> = {
  safe:'bg-green-500 text-white', fit:'bg-blue-500 text-white',
  bold:'bg-yellow-500 text-white', try:'bg-red-500 text-white', na:'bg-gray-300 text-gray-600',
}
const GYE_LIST: Gye[] = ['이과','문과','의약','통합']
const JT_LIST: Jt[] = ['종합','교과']

function toggleArr<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]
}

function Chip({ label, on, onClick, cls }: { label: string; on: boolean; onClick: () => void; cls?: string }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none
        ${on ? (cls ?? 'bg-gray-900 text-white border-gray-900') : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'}`}>
      {label}
    </button>
  )
}

export default function FilterSidebar() {
  const {
    myGrade, setMyGrade,
    filter, setFilter,
  } = useStore()

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [showAllUnivs, setShowAllUnivs] = useState(false)

  // 현재 보여줄 대학 목록
  const displayedUnivs = selectedRegion
    ? REGION_UNIVS[selectedRegion] ?? []
    : showAllUnivs ? ALL_UNIVS_BY_REGION : []

  function toggleUniv(u: string) {
    setFilter({ univs: toggleArr(filter.univs, u) })
  }

  function selectRegion(region: string) {
    if (selectedRegion === region) {
      setSelectedRegion(null)
    } else {
      setSelectedRegion(region)
    }
  }

  function selectAllInRegion(region: string) {
    const univs = REGION_UNIVS[region] ?? []
    const allOn = univs.every(u => filter.univs.includes(u))
    if (allOn) {
      setFilter({ univs: filter.univs.filter(u => !univs.includes(u)) })
    } else {
      const merged = Array.from(new Set([...filter.univs, ...univs]))
      setFilter({ univs: merged })
    }
  }

  return (
    <aside className="w-52 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 p-3 space-y-4">

      {/* 내신 등급 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">내신 등급 입력</div>
        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="text-[10px] text-gray-400 font-semibold">석차</span>
          <span className="text-base font-bold text-[#1a3a6b]">{myGrade.toFixed(2)}</span>
          <span className="text-gray-300 text-xs">/</span>
          <span className="text-[10px] text-gray-400 font-semibold">정밀</span>
          <span className="text-sm font-bold text-blue-500">{myGrade.toFixed(2)}</span>
        </div>
        <input type="range" min="1.0" max="5.0" step="0.1" value={myGrade}
          onChange={e => setMyGrade(parseFloat(e.target.value))}
          className="w-full accent-[#1a3a6b]" />
        <div className="grid grid-cols-5 text-[9px] text-gray-300 mt-0.5">
          {['안정','적정','소신','도전',''].map((l,i) => <span key={i}>{l}</span>)}
        </div>
        {/* 과목 조합 패널 */}
      <GradeComboPanel />

      {/* 가능성 범례 */}
        <div className="mt-2 space-y-0.5">
          {[
            ['bg-green-500','안정 — 70%컷보다 0.3↑ 유리'],
            ['bg-blue-500', '적정 — 70%컷 ±0.3 범위'],
            ['bg-yellow-500','소신 — 0.3~0.7 불리'],
            ['bg-red-500',  '도전 — 0.7↑ 불리'],
            ['bg-gray-300', '미공개 — 데이터 없음'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 지원 가능성 필터 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">지원 가능성 필터</div>
        <div className="flex flex-wrap gap-1">
          {POSS_LIST.map(p => (
            <Chip key={p} label={POSS_LABEL[p]} on={filter.posses.includes(p)}
              cls={filter.posses.includes(p) ? POSS_CLS[p] : undefined}
              onClick={() => setFilter({ posses: toggleArr(filter.posses, p) })} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 검색 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">학교·학과 검색</div>
        <input type="text" placeholder="대학명, 학과명 입력..." value={filter.query}
          onChange={e => setFilter({ query: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500" />
      </div>

      <div className="h-px bg-gray-100" />

      {/* 지역별 대학 필터 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">지역별 대학 필터</div>

        {/* 지역 선택 버튼 */}
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.keys(REGION_UNIVS).map(region => {
            const univsInRegion = REGION_UNIVS[region]
            const selectedCount = univsInRegion.filter(u => filter.univs.includes(u)).length
            const isOpen = selectedRegion === region
            return (
              <button key={region} onClick={() => selectRegion(region)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all
                  ${isOpen ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                    : selectedCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'}`}>
                {region}
                {selectedCount > 0 && <span className="ml-1 text-[10px]">({selectedCount})</span>}
              </button>
            )
          })}
        </div>

        {/* 선택된 지역의 대학 버튼 */}
        {selectedRegion && (
          <div className="bg-gray-50 rounded-xl p-2 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-gray-500">{selectedRegion} 대학</span>
              <button onClick={() => selectAllInRegion(selectedRegion)}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold">
                {REGION_UNIVS[selectedRegion].every(u => filter.univs.includes(u)) ? '전체해제' : '전체선택'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(REGION_UNIVS[selectedRegion] ?? []).map(u => (
                <button key={u} onClick={() => toggleUniv(u)}
                  className={`px-2 py-0.5 rounded-full text-[11px] border transition-all
                    ${filter.univs.includes(u)
                      ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선택된 대학 표시 */}
        {filter.univs.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">선택됨 {filter.univs.length}개</span>
              <button onClick={() => setFilter({ univs: [] })}
                className="text-[10px] text-red-400 hover:text-red-600">전체해제</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {filter.univs.map(u => (
                <button key={u} onClick={() => toggleUniv(u)}
                  className="px-1.5 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded text-[10px] border border-[#1a3a6b]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors">
                  {u} ×
                </button>
              ))}
            </div>
          </div>
        )}

        {filter.univs.length === 0 && !selectedRegion && (
          <p className="text-[10px] text-gray-400">지역을 선택하면 대학 버튼이 나타나요</p>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      {/* 전형 유형 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">전형 유형</div>
        <div className="flex gap-1">
          {JT_LIST.map(jt => (
            <Chip key={jt} label={`학생부 ${jt}`} on={filter.jts.includes(jt)}
              onClick={() => setFilter({ jts: toggleArr(filter.jts, jt) })} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 이수 계열 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">이수 계열</div>
        <div className="flex flex-wrap gap-1">
          {GYE_LIST.map(g => (
            <Chip key={g} label={g} on={filter.gyes.includes(g)}
              onClick={() => setFilter({ gyes: toggleArr(filter.gyes, g) })} />
          ))}
        </div>
        <p className="text-[9px] text-gray-400 mt-1">통합: 문·이과 구분 없이 지원 가능</p>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 학과 대분류 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">학과 대분류</div>
        <div className="flex flex-wrap gap-1">
          {CAT_LIST.map(c => (
            <Chip key={c} label={CAT_LABEL[c]} on={filter.cats.includes(c)}
              onClick={() => setFilter({ cats: toggleArr(filter.cats, c) })} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 등급컷 표시 상한 */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">등급컷 표시 상한</div>
        <input type="range" min="1.0" max="6.0" step="0.1" value={filter.gradeLimit}
          onChange={e => setFilter({ gradeLimit: parseFloat(e.target.value) })}
          className="w-full accent-[#1a3a6b]" />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>이 등급컷 이하 전형만 표시</span>
          <span className="font-bold text-gray-600">{filter.gradeLimit.toFixed(1)}등급</span>
        </div>
      </div>

    </aside>
  )
}
