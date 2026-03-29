import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { JEONGSI_DB, ENG_SCORE, ENG_DEDUCT, type JeongsiUniv } from '../data/jeongsi'

const UNIV_COLOR: Record<string, string> = {
  '서울대':'#1a3a6b', '연세대':'#1d5c9e', '고려대':'#8b1a1a'
}

/** 과목 백분위 → 대학별 환산점수 계산 */
function calcScore(u: JeongsiUniv, input: ScoreInput): number {
  const { kor, math, eng, sci1, sci2 } = input
  const sciAvg = u.sciCount === 2 ? (sci1 + sci2) / 2 : sci1

  if (u.engGrade === 'score') {
    // 영어를 점수로 반영
    const engPt = ENG_SCORE[eng] ?? 200
    return (kor * u.ratio.kor / 100) +
           (math * u.ratio.math / 100) +
           (engPt * u.ratio.eng / 100) +
           (sciAvg * u.ratio.sci / 100)
  } else {
    // 영어를 감점으로 반영 (서울대)
    const base = (kor * u.ratio.kor / 100) +
                 (math * u.ratio.math / 100) +
                 (sciAvg * u.ratio.sci / 100)
    const deduct = ENG_DEDUCT[eng] ?? 0
    return base - deduct
  }
}

function possClass(score: number, pct70: number | null) {
  if (!pct70) return { cls: 'bg-gray-100 text-gray-500 border-gray-300', lbl: '미공개' }
  const diff = score - pct70
  if (diff >=  3) return { cls: 'bg-green-100 text-green-800 border-green-300', lbl: '안정' }
  if (diff >= -1) return { cls: 'bg-blue-100 text-blue-800 border-blue-300',  lbl: '적정' }
  if (diff >= -4) return { cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', lbl: '소신' }
  return { cls: 'bg-red-100 text-red-800 border-red-300', lbl: '도전' }
}

interface ScoreInput {
  kor: number; math: number; eng: number; sci1: number; sci2: number
}
const DEFAULT: ScoreInput = { kor: 85, math: 90, eng: 1, sci1: 88, sci2: 85 }

function SliderRow({ label, sub, name, min, max, value, onChange }: {
  label: string; sub: string; name: keyof ScoreInput
  min: number; max: number; value: number; onChange: (k: keyof ScoreInput, v: number) => void
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_56px] gap-3 items-center">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[10px] text-gray-400">{sub}</div>
      </div>
      <input type="range" min={min} max={max} step="1" value={value}
        onChange={e => onChange(name, parseInt(e.target.value))}
        className="accent-[#1a3a6b]" />
      <div className="text-right font-bold text-sm text-[#1a3a6b]">
        {name === 'eng' ? `${value}등급` : `${value}점`}
      </div>
    </div>
  )
}

export default function JeongsiPage() {
  const [scores, setScores] = useState<ScoreInput>(DEFAULT)
  const [catFilter, setCat]  = useState<'전체' | '인문' | '자연' | '의약'>('전체')
  const [univFilter, setUniv] = useState<string>('전체')

  function setScore(k: keyof ScoreInput, v: number) {
    setScores(s => ({ ...s, [k]: v }))
  }

  const results = useMemo(() => {
    return JEONGSI_DB
      .filter(u => catFilter === '전체' || u.cat === catFilter)
      .filter(u => univFilter === '전체' || u.univ === univFilter)
      .map(u => {
        const raw = calcScore(u, scores)
        const diff = u.pct70 != null ? raw - u.pct70 : null
        return { ...u, raw, diff }
      })
      .sort((a, b) => (b.diff ?? -99) - (a.diff ?? -99))
  }, [scores, catFilter, univFilter])

  const chipBase = 'px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-all select-none'
  const chipOn  = 'bg-gray-900 text-white border-gray-900'
  const chipOff = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* 상단바 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-3">
        <Link to="/" className="text-base font-bold tracking-tight">
          <span className="text-[#1a3a6b]">SIGnAL</span>
          <span className="text-gray-800"> EDU</span>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-[13px] text-gray-500">정시 수능 환산 계산기</span>
        <Link to="/simulator" className="ml-auto text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          수시 시뮬레이터 →
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-6 grid md:grid-cols-[320px_1fr] gap-5 items-start">

        {/* 왼쪽: 성적 입력 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-5">
          <h2 className="text-sm font-bold mb-4 text-gray-700">수능 성적 입력</h2>
          <div className="space-y-4">
            <SliderRow label="국어" sub="백분위" name="kor" min={40} max={100} value={scores.kor} onChange={setScore} />
            <SliderRow label="수학" sub="백분위" name="math" min={40} max={100} value={scores.math} onChange={setScore} />
            <SliderRow label="영어" sub="등급 (1~9)" name="eng" min={1} max={9} value={scores.eng} onChange={setScore} />
            <SliderRow label="탐구 1과목" sub="백분위" name="sci1" min={40} max={100} value={scores.sci1} onChange={setScore} />
            <SliderRow label="탐구 2과목" sub="백분위 (선택)" name="sci2" min={40} max={100} value={scores.sci2} onChange={setScore} />
          </div>

          <div className="mt-5 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed">
            <strong>계산 방식:</strong> 각 대학 수능 반영 비율에 따라 환산점수를 계산하고,
            2025학년도 합격선(70%컷 백분위)과 비교해 가능성을 분류합니다.
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div>
          {/* 필터 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="flex gap-1.5 flex-wrap">
              {(['전체','인문','자연','의약'] as const).map(c => (
                <button key={c} onClick={() => setCat(c)} className={`${chipBase} ${catFilter===c?chipOn:chipOff}`}>{c}</button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex gap-1.5 flex-wrap">
              {['전체','서울대','연세대','고려대'].map(u => (
                <button key={u} onClick={() => setUniv(u)}
                  className={`${chipBase} ${univFilter===u ? (u==='서울대'?'bg-[#1a3a6b] text-white border-[#1a3a6b]' : u==='연세대'?'bg-[#1d5c9e] text-white border-[#1d5c9e]' : u==='고려대'?'bg-[#8b1a1a] text-white border-[#8b1a1a]' : chipOn) : chipOff}`}>
                  {u}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-400">{results.length}개 학과</span>
          </div>

          {/* 결과 카드 */}
          <div className="space-y-2">
            {results.map(r => {
              const poss = possClass(r.raw, r.pct70)
              const diffStr = r.diff != null ? (r.diff >= 0 ? `+${r.diff.toFixed(1)}` : r.diff.toFixed(1)) : '—'
              const diffClr = r.diff == null ? 'text-gray-400' : r.diff >= 0 ? 'text-green-700' : 'text-red-500'
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold" style={{ color: UNIV_COLOR[r.univ] }}>{r.univ}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${poss.cls}`}>{poss.lbl}</span>
                    </div>
                    <div className="text-sm font-bold">{r.dept}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{r.cat} · 경쟁률 {r.경쟁률.toFixed(1)}:1</div>
                  </div>

                  {/* 수능 반영 비율 미니 */}
                  <div className="hidden md:flex gap-1 text-[10px] text-gray-400 flex-col items-end">
                    <span>국{r.ratio.kor}·수{r.ratio.math}·영{r.ratio.eng}·탐{r.ratio.sci}</span>
                    <span>합격선 70%컷: {r.pct70 ? `${r.pct70}점` : '미공개'}</span>
                  </div>

                  {/* 내 환산점수 */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-[#1a3a6b]">{r.raw.toFixed(1)}</div>
                    <div className={`text-xs font-semibold ${diffClr}`}>{diffStr}점</div>
                    <div className="text-[10px] text-gray-400">내 환산점수</div>
                  </div>
                </div>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
              조건에 맞는 학과가 없습니다.
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            * 대학별 반영 비율은 2025학년도 기준이며, 실제 입시와 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
