import { useStore } from '../hooks/useStore'
import { DB, UNIV_COLOR } from '../data/db'
import { gradeColor, gyeBadgeClass, gyeLabel } from '../hooks/usePoss'

// 연도별 샘플 데이터
const DETAIL: Record<string, { yr:number; 모집:number; 충원:number; 경쟁률:number; g50:number|null; g70:number|null; 환산50:number|null; 환산70:number|null }[]> = {
  k16: [
    {yr:2025,모집:18,충원:6, 경쟁률:23.44,g50:1.06,g70:1.08,환산50:79.91,환산70:79.88},
    {yr:2024,모집:18,충원:5, 경쟁률:22.80,g50:1.07,g70:1.09,환산50:79.88,환산70:79.85},
    {yr:2023,모집:17,충원:7, 경쟁률:24.10,g50:1.08,g70:1.10,환산50:79.85,환산70:79.82},
    {yr:2022,모집:16,충원:6, 경쟁률:21.50,g50:1.10,g70:1.12,환산50:79.80,환산70:79.76},
  ],
  y03: [
    {yr:2025,모집:11,충원:5, 경쟁률:13.91,g50:1.33,g70:1.36,환산50:null,환산70:null},
    {yr:2024,모집:10,충원:4, 경쟁률:14.20,g50:1.35,g70:1.38,환산50:null,환산70:null},
    {yr:2023,모집:12,충원:4, 경쟁률:12.80,g50:1.37,g70:1.41,환산50:null,환산70:null},
    {yr:2022,모집:11,충원:3, 경쟁률:11.60,g50:1.39,g70:1.43,환산50:null,환산70:null},
  ],
}
function getDetail(id: string, d: typeof DB[0]) {
  if (DETAIL[id]) return DETAIL[id]
  return [{yr:2025, 모집:10, 충원:3, 경쟁률:d.경쟁률, g50:d.g50, g70:d.g70, 환산50:null, 환산70:null}]
}

export default function DetailModal() {
  const { detailId, closeDetail } = useStore()
  if (!detailId) return null

  const d = DB.find(x => x.id === detailId)
  if (!d) return null
  const rows = getDetail(detailId, d)

  const maxG = Math.max(...rows.map(r => r.g70 ?? r.g50 ?? 0).filter(Boolean)) * 1.3 || 5
  const maxC = Math.max(...rows.map(r => r.경쟁률)) * 1.3
  const BAR_H = 80

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5"
         onClick={e => e.target === e.currentTarget && closeDetail()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-y-auto flex flex-col">

        {/* 헤더 */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex-1">
            <h2 className="text-base font-bold">{d.major}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-semibold text-xs" style={{ color: UNIV_COLOR[d.univ] }}>{d.univ}</span>
              <span className="text-xs text-gray-400">{d.jt} · {d.jeon}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${gyeBadgeClass(d.gye)}`}>
                {gyeLabel(d.gye)}
              </span>
            </div>
          </div>
          <button onClick={closeDetail}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100 text-base flex-shrink-0">
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-[1fr_200px] gap-5 items-start">

            {/* 왼쪽: 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th rowSpan={2} className="p-2 text-center bg-gray-50 border border-gray-200">연도</th>
                    <th colSpan={2} className="p-2 text-center bg-gray-50 border border-gray-200">모집/인원</th>
                    <th colSpan={2} className="p-2 text-center bg-green-50 border border-gray-200">경쟁률/지원</th>
                    <th colSpan={2} className="p-2 text-center bg-yellow-50 border border-gray-200">환산점수</th>
                    <th colSpan={4} className="p-2 text-center bg-orange-50 border border-gray-200">교과등급(컷)</th>
                  </tr>
                  <tr>
                    {['모집','충원','경쟁률','지원추정','50%','70%','50%컷','50%추정등수','70%컷','70%추정등수'].map(h => (
                      <th key={h} className="p-1.5 text-center bg-gray-50 border border-gray-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const total = r.모집 + r.충원
                    const e50 = r.g50 ? `${(r.g50*total).toFixed(1)}/${total}명` : '—'
                    const e70 = r.g70 ? `${(r.g70*total).toFixed(1)}/${total}명` : '—'
                    return (
                      <tr key={r.yr} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 text-center font-bold">{r.yr}</td>
                        <td className="p-2 text-center">{r.모집}</td>
                        <td className="p-2 text-center">{r.충원}</td>
                        <td className="p-2 text-center font-semibold">{r.경쟁률.toFixed(1)}</td>
                        <td className="p-2 text-center text-gray-400">—</td>
                        <td className="p-2 text-center">{r.환산50 ?? '—'}</td>
                        <td className="p-2 text-center">{r.환산70 ?? '—'}</td>
                        <td className={`p-2 text-center font-bold ${gradeColor(r.g50)}`}>{r.g50?.toFixed(2) ?? '—'}</td>
                        <td className="p-2 text-center text-gray-500">{e50}</td>
                        <td className={`p-2 text-center font-bold ${gradeColor(r.g70)}`}>{r.g70?.toFixed(2) ?? '—'}</td>
                        <td className="p-2 text-center text-gray-500">{e70}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 오른쪽: 막대 그래프 */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-500 mb-3">4개년 등급(70%컷) · 경쟁률 추이</div>
              <div className="flex items-end gap-2" style={{ height: `${BAR_H + 48}px` }}>
                {rows.map(r => {
                  const gv = r.g70 ?? r.g50
                  const gh = gv ? Math.round((gv / maxG) * BAR_H) : 2
                  const ch = Math.round((r.경쟁률 / maxC) * BAR_H)
                  const gc = gv && gv <= 1.3 ? '#dc2626' : gv && gv <= 1.7 ? '#d97706' : gv && gv <= 2.3 ? '#2563eb' : '#6b7280'
                  return (
                    <div key={r.yr} className="flex flex-col items-center gap-0 flex-1">
                      <div className="text-[10px] font-bold mb-0.5" style={{ color: gc }}>{gv?.toFixed(2) ?? '—'}</div>
                      <div className="text-[9px] text-gray-400 mb-0.5">{r.경쟁률.toFixed(1)}</div>
                      <div className="flex items-end gap-0.5 flex-1 w-full" style={{ height: `${BAR_H}px` }}>
                        <div className="flex-1 rounded-t" style={{ height: `${gh}px`, background: gc, opacity: 0.8, minHeight: '2px' }} />
                        <div className="flex-1 rounded-t bg-slate-400" style={{ height: `${ch}px`, opacity: 0.6, minHeight: '2px' }} />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{r.yr}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-3 justify-center">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-600" />70%컷 등급
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-400" />경쟁률
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
