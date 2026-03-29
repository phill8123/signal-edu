export type Gye = '이과' | '문과' | '의약' | '통합'
export type Cat = '공학' | '자연과학' | '의약보건' | '경영경제' | '인문' | '사회과학'
export type Jt  = '종합' | '교과'
export type Poss = 'safe' | 'fit' | 'bold' | 'try' | 'na'
export type SortKey = 'poss' | 'grade' | 'comp' | 'univ'
export type ViewMode = 'card' | 'group' | 'table'

export interface Major {
  id: string
  univ: string
  jt: Jt
  jeon: string
  major: string
  gye: Gye
  cat: Cat
  경쟁률: number
  g50: number | null
  g70: number | null
}

export interface YearDetail {
  yr: number
  모집: number
  충원: number
  경쟁률: number
  지원추정: number | null
  탈락추정: number | null
  환산50: number | null
  환산70: number | null
  g50: number | null
  g70: number | null
}

export interface Student {
  id: string
  name: string
  grade: number
  label: string
}

export interface FilterState {
  univs: string[]
  jts: Jt[]
  gyes: Gye[]
  cats: Cat[]
  posses: Poss[]
  gradeLimit: number
  query: string
}
