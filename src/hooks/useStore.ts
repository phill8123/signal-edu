import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, Gye, Jt, Poss, SortKey, ViewMode } from '../types'
import { STUDENTS } from '../data/db'

interface StudentData {
  grade: number
  selected: string[]  // major id[]
}

interface AppState {
  // 현재 학생
  studentId: string
  myGrade: number
  selected: string[]

  // 필터
  filter: FilterState

  // 정렬·보기
  sortKey: SortKey
  viewMode: ViewMode

  // 상세 모달
  detailId: string | null

  // 학생별 저장 데이터
  studentData: Record<string, StudentData>

  // Actions
  setStudent: (id: string) => void
  setMyGrade: (g: number) => void
  toggleSelected: (id: string) => void
  removeSelected: (id: string) => void
  clearSelected: () => void
  saveCurrentStudent: () => void
  setFilter: (patch: Partial<FilterState>) => void
  setSortKey: (k: SortKey) => void
  setViewMode: (m: ViewMode) => void
  openDetail: (id: string) => void
  closeDetail: () => void
}

const DEFAULT_FILTER: FilterState = {
  univs:      ['서울대','연세대','고려대','성균관대','한양대','서강대','이화여대','중앙대','경희대','한국외대','서울시립대','건국대','동국대','숙명여대','세종대','광운대'],
  jts:        ['종합', '교과'] as Jt[],
  gyes:       ['이과', '문과', '의약', '통합'] as Gye[],
  cats:       ['공학', '자연과학', '의약보건', '경영경제', '인문', '사회과학'],
  posses:     ['safe', 'fit', 'bold', 'try', 'na'] as Poss[],
  gradeLimit: 5.0,
  query:      '',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      studentId:   's1',
      myGrade:     1.8,
      selected:    [],
      filter:      DEFAULT_FILTER,
      sortKey:     'poss',
      viewMode:    'card',
      detailId:    null,
      studentData: {},

      setStudent: (id) => {
        const saved = get().studentData[id]
        const stu = STUDENTS.find(s => s.id === id)
        set({
          studentId: id,
          myGrade:   saved?.grade  ?? stu?.grade  ?? 1.8,
          selected:  saved?.selected ?? [],
        })
      },

      setMyGrade: (g) => set({ myGrade: g }),

      toggleSelected: (id) => {
        const { selected } = get()
        const MAX = 10
        if (selected.includes(id)) {
          set({ selected: selected.filter(s => s !== id) })
        } else if (selected.length < MAX) {
          set({ selected: [...selected, id] })
        }
      },

      removeSelected: (id) =>
        set(s => ({ selected: s.selected.filter(x => x !== id) })),

      clearSelected: () => set({ selected: [] }),

      saveCurrentStudent: () => {
        const { studentId, myGrade, selected, studentData } = get()
        set({
          studentData: {
            ...studentData,
            [studentId]: { grade: myGrade, selected },
          }
        })
      },

      setFilter: (patch) =>
        set(s => ({ filter: { ...s.filter, ...patch } })),

      setSortKey: (k) => set({ sortKey: k }),
      setViewMode: (m) => set({ viewMode: m }),
      openDetail:  (id) => set({ detailId: id }),
      closeDetail: () => set({ detailId: null }),
    }),
    { name: 'signal-edu-store' }
  )
)
