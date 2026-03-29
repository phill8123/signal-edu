# SIGnAL EDU — AI 대학입시 컨설팅 플랫폼

> **STEP 1~5 완성본** — 배포 준비 완료

## 30초 실행

```bash
npm install && npm run dev
# → http://localhost:5173
```

백엔드 없이도 동작합니다. 전체 가이드는 **DEPLOY.md** 참조.

---

## 완성된 기능 전체

| 기능 | 페이지 | 상태 |
|------|--------|------|
| 수시 지원 시뮬레이터 | /simulator | ✅ 완성 |
| 인서울 130개 전형 DB | - | ✅ 완성 |
| 정시 수능 환산 계산기 | /jeongsi | ✅ 완성 |
| AI 학종 적합도 평가 | /ai-eval | ✅ 완성 |
| 면접 준비 코칭 + AI 모의면접 | /interview | ✅ 완성 |
| 마이페이지 (성적·지원목록) | /mypage | ✅ 완성 |
| 랜딩 페이지 (소개·요금제) | / | ✅ 완성 |
| 로그인·회원가입 | /login | ✅ 완성 |
| 토스페이먼츠 결제 | /payment | ✅ 완성 |
| FastAPI 백엔드 | - | ✅ 완성 |
| PostgreSQL DB 연동 | - | ✅ 완성 |
| Claude API 연동 | - | ✅ 완성 |
| PWA (홈화면 설치) | - | ✅ 완성 |
| Vercel + Railway 배포 설정 | - | ✅ 완성 |

## 기술 스택

**프론트엔드**: React 18 + TypeScript + Tailwind CSS + Vite + Zustand + React Router 6

**백엔드**: FastAPI + SQLAlchemy (PostgreSQL/SQLite) + JWT + Claude API

**인프라**: Vercel (프론트) + Railway (백엔드) + Supabase (인증) + 토스페이먼츠 (결제)

## 파일 구조

```
signal-edu/
├── src/                     # 프론트엔드
│   ├── pages/               # 8개 페이지
│   ├── components/          # 6개 공통 컴포넌트
│   ├── data/                # DB (수시130·정시·면접)
│   ├── hooks/               # 상태관리·필터·계산 로직
│   ├── context/             # 인증 컨텍스트
│   └── lib/                 # API 클라이언트·Supabase
├── backend/                 # FastAPI 백엔드
│   ├── routers/             # auth·students·majors·ai_eval·payments
│   ├── models/              # SQLAlchemy ORM
│   ├── schemas/             # Pydantic 스키마
│   └── core/                # 설정·DB·보안
├── DEPLOY.md                # 단계별 배포 가이드
├── deploy.sh                # 배포 자동화 스크립트
├── vercel.json              # Vercel SPA 설정
└── railway.json             # Railway 배포 설정
```
