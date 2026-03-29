import { useMemo } from 'react'
import { DB } from '../data/db'
import { getPoss, POSS_ORDER } from './usePoss'
import { useStore } from './useStore'
import type { Major } from '../types'

export function useFiltered(): Major[] {
  const { filter, sortKey, myGrade } = useStore()

  return useMemo(() => {
    const q = filter.query.trim().toLowerCase()

    const filtered = DB.filter(d => {
      // 대학 필터 — 선택된 대학이 있으면 그 대학만, 없으면 전체
      if (filter.univs.length > 0 && !filter.univs.includes(d.univ)) return false

      // 검색어 — 대학명 또는 학과명 또는 전형명
      if (q) {
        const match = d.major.toLowerCase().includes(q) ||
                      d.univ.toLowerCase().includes(q) ||
                      d.jeon.toLowerCase().includes(q) ||
                      d.univ.replace('대학교','대').includes(q) ||
                      d.univ.replace('대','').includes(q)
        if (!match) return false
      }

      // 미공개 전형은 등급 필터·계열 필터 무관하게 포함
      const isUnknown = d.jeon === '미공개'
      if (isUnknown) return true

      if (!filter.jts.includes(d.jt))   return false
      if (!filter.cats.includes(d.cat)) return false

      // 통합 계열
      const gyeOk = d.gye === '통합'
        ? filter.gyes.includes('통합') || filter.gyes.includes('이과') || filter.gyes.includes('문과')
        : filter.gyes.includes(d.gye)
      if (!gyeOk) return false

      const ref = d.g70 ?? d.g50
      if (ref && ref > filter.gradeLimit) return false

      const poss = getPoss(d, myGrade)
      if (!filter.posses.includes(poss)) return false

      return true
    })

    return filtered.sort((a, b) => {
      // 미공개는 항상 맨 아래
      if (a.jeon === '미공개' && b.jeon !== '미공개') return 1
      if (b.jeon === '미공개' && a.jeon !== '미공개') return -1

      if (sortKey === 'poss') {
        const pa = POSS_ORDER[getPoss(a, myGrade)]
        const pb = POSS_ORDER[getPoss(b, myGrade)]
        if (pa !== pb) return pa - pb
        return (a.g70 ?? a.g50 ?? 9) - (b.g70 ?? b.g50 ?? 9)
      }
      if (sortKey === 'grade') return (a.g70 ?? a.g50 ?? 9) - (b.g70 ?? b.g50 ?? 9)
      if (sortKey === 'comp')  return a.경쟁률 - b.경쟁률
      if (sortKey === 'univ')  return a.univ.localeCompare(b.univ, 'ko') || a.major.localeCompare(b.major, 'ko')
      return 0
    })
  }, [filter, sortKey, myGrade])
}
