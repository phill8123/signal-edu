import type { Major, Poss } from '../types'

export function getPoss(d: Major, myGrade: number): Poss {
  const ref = d.g70 ?? d.g50
  if (!ref) return 'na'
  const diff = myGrade - ref
  if (diff <= -0.3) return 'safe'
  if (diff <=  0.3) return 'fit'
  if (diff <=  0.7) return 'bold'
  return 'try'
}

export const POSS_LABEL: Record<Poss, string> = {
  safe: '안정', fit: '적정', bold: '소신', try: '도전', na: '미공개'
}

export const POSS_ORDER: Record<Poss, number> = {
  safe: 0, fit: 1, bold: 2, try: 3, na: 4
}

export const POSS_BAR_COLOR: Record<Poss, string> = {
  safe: '#bbf7d0', fit: '#bfdbfe', bold: '#fde68a', try: '#fecaca', na: '#e4e2db'
}

export const POSS_BADGE: Record<Poss, string> = {
  safe: 'bg-green-100 text-green-800 border-green-300',
  fit:  'bg-blue-100 text-blue-800 border-blue-300',
  bold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  try:  'bg-red-100 text-red-800 border-red-300',
  na:   'bg-gray-100 text-gray-600 border-gray-300',
}

export function gradeColor(g: number | null): string {
  if (!g) return 'text-gray-400'
  if (g <= 1.3) return 'text-red-600'
  if (g <= 1.7) return 'text-amber-600'
  if (g <= 2.3) return 'text-blue-700'
  return 'text-gray-500'
}

export function catLabel(cat: string): string {
  const m: Record<string, string> = {
    '공학': '공학계열', '자연과학': '자연과학', '의약보건': '의약·보건',
    '경영경제': '경영·경제', '인문': '인문계열', '사회과학': '사회과학'
  }
  return m[cat] ?? cat
}

export function gyeBadgeClass(gye: string): string {
  const m: Record<string, string> = {
    '문과': 'bg-purple-50 text-purple-800 border-purple-200',
    '이과': 'bg-blue-50 text-blue-800 border-blue-200',
    '의약': 'bg-red-50 text-red-800 border-red-200',
    '통합': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }
  return m[gye] ?? 'bg-gray-100 text-gray-600 border-gray-200'
}

export function gyeLabel(gye: string): string {
  return gye === '통합' ? '문·이과 통합' : gye
}
