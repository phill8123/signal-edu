export interface JeongsiUniv {
  id: string
  univ: string
  dept: string
  cat: '인문' | '자연' | '의약'
  /** 수능 반영 비율 합계 100 */
  ratio: { kor: number; math: number; eng: number; sci: number }
  /** 탐구 과목 수 */
  sciCount: 1 | 2
  /** 영어 등급별 감점/가산 */
  engGrade: 'score' | 'deduct'
  /** 2025 기준 합격선 백분위 (50%컷) */
  pct50: number | null
  /** 2025 기준 합격선 백분위 (70%컷) */
  pct70: number | null
  경쟁률: number
}

export const JEONGSI_DB: JeongsiUniv[] = [
  // 서울대
  {id:'sj01',univ:'서울대',dept:'경영대학',    cat:'인문',ratio:{kor:33.3,math:40,eng:0,sci:26.7},sciCount:2,engGrade:'deduct',pct50:97,pct70:96,경쟁률:3.2},
  {id:'sj02',univ:'서울대',dept:'경제학부',    cat:'인문',ratio:{kor:33.3,math:40,eng:0,sci:26.7},sciCount:2,engGrade:'deduct',pct50:97,pct70:96,경쟁률:3.1},
  {id:'sj03',univ:'서울대',dept:'컴퓨터공학부',cat:'자연',ratio:{kor:20,math:40,eng:0,sci:40},  sciCount:2,engGrade:'deduct',pct50:99,pct70:98,경쟁률:4.5},
  {id:'sj04',univ:'서울대',dept:'전기정보공학부',cat:'자연',ratio:{kor:20,math:40,eng:0,sci:40}, sciCount:2,engGrade:'deduct',pct50:98,pct70:97,경쟁률:3.8},
  {id:'sj05',univ:'서울대',dept:'기계공학부',  cat:'자연',ratio:{kor:20,math:40,eng:0,sci:40},  sciCount:2,engGrade:'deduct',pct50:97,pct70:96,경쟁률:3.3},
  {id:'sj06',univ:'서울대',dept:'의예과',      cat:'의약',ratio:{kor:20,math:40,eng:0,sci:40},  sciCount:2,engGrade:'deduct',pct50:99,pct70:99,경쟁률:7.1},
  // 연세대
  {id:'yj01',univ:'연세대',dept:'경영학과',    cat:'인문',ratio:{kor:30,math:35,eng:20,sci:15},sciCount:1,engGrade:'score',pct50:95,pct70:94,경쟁률:4.1},
  {id:'yj02',univ:'연세대',dept:'경제학부',    cat:'인문',ratio:{kor:30,math:35,eng:20,sci:15},sciCount:1,engGrade:'score',pct50:95,pct70:93,경쟁률:3.9},
  {id:'yj03',univ:'연세대',dept:'컴퓨터과학과',cat:'자연',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:97,pct70:96,경쟁률:5.2},
  {id:'yj04',univ:'연세대',dept:'전기전자공학부',cat:'자연',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:96,pct70:95,경쟁률:4.8},
  {id:'yj05',univ:'연세대',dept:'의예과',      cat:'의약',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:99,pct70:98,경쟁률:8.3},
  // 고려대
  {id:'kj01',univ:'고려대',dept:'경영대학',    cat:'인문',ratio:{kor:35,math:30,eng:20,sci:15},sciCount:1,engGrade:'score',pct50:94,pct70:93,경쟁률:4.3},
  {id:'kj02',univ:'고려대',dept:'경제학과',    cat:'인문',ratio:{kor:35,math:30,eng:20,sci:15},sciCount:1,engGrade:'score',pct50:94,pct70:92,경쟁률:4.0},
  {id:'kj03',univ:'고려대',dept:'컴퓨터학과',  cat:'자연',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:96,pct70:95,경쟁률:5.0},
  {id:'kj04',univ:'고려대',dept:'전기전자공학부',cat:'자연',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:95,pct70:94,경쟁률:4.6},
  {id:'kj05',univ:'고려대',dept:'의과대학',    cat:'의약',ratio:{kor:20,math:40,eng:20,sci:20},sciCount:2,engGrade:'score',pct50:99,pct70:98,경쟁률:7.8},
]

/** 수능 등급 → 영어 환산 점수 (연세대·고려대 방식) */
export const ENG_SCORE: Record<number, number> = {
  1:200, 2:190, 3:180, 4:170, 5:150, 6:130, 7:110, 8:90, 9:50
}

/** 수능 등급 → 영어 감점 (서울대 방식) */
export const ENG_DEDUCT: Record<number, number> = {
  1:0, 2:0.5, 3:1, 4:2, 5:3, 6:5, 7:7, 8:9, 9:10
}
