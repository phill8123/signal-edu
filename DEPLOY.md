# SIGnAL EDU — 단계별 배포 가이드

---

## 1단계: GitHub 저장소 생성

```bash
git init
git add .
git commit -m "feat: SIGnAL EDU STEP 1~5 완성"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-id/signal-edu.git
git push -u origin main
```

---

## 2단계: Supabase 설정 (인증)

1. https://supabase.com → New Project
2. **Project URL**과 **anon public key** 복사
3. Authentication → Providers → **Kakao** 활성화
   - 카카오 개발자 콘솔(developers.kakao.com)에서 앱 생성
   - REST API 키 → Supabase에 입력
   - Redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`

---

## 3단계: 백엔드 → Railway 배포

### Railway 설정
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 새 프로젝트 생성
railway new signal-edu-backend

# PostgreSQL 추가 (Railway 대시보드에서)
# Project → Add Service → Database → PostgreSQL

# 배포
railway up
```

### Railway 환경변수 설정 (대시보드 → Variables)
```
DATABASE_URL       = (Railway가 자동 생성 — PostgreSQL 연결 문자열)
SECRET_KEY         = (openssl rand -hex 32 으로 생성)
ANTHROPIC_API_KEY  = sk-ant-...
ALLOWED_ORIGINS    = https://signal-edu.vercel.app
TOSS_SECRET_KEY    = (토스페이먼츠 시크릿 키)
```

### DB 초기 데이터 삽입
```bash
railway run python -m backend.scripts.seed_db
```

### 배포 URL 확인
```
https://signal-edu-backend.up.railway.app
```

---

## 4단계: 프론트엔드 → Vercel 배포

### Vercel 설정
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 첫 배포 (대화형 설정)
vercel deploy

# 프로덕션 배포
vercel --prod
```

### Vercel 환경변수 설정 (대시보드 → Settings → Environment Variables)
```
VITE_API_URL           = https://signal-edu-backend.up.railway.app
VITE_SUPABASE_URL      = https://[project].supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
VITE_TOSS_CLIENT_KEY   = (토스페이먼츠 클라이언트 키)
```

### 도메인 연결 (선택)
Vercel 대시보드 → Domains → signal-edu.kr 추가
DNS: CNAME → cname.vercel-dns.com

---

## 5단계: 토스페이먼츠 설정 (결제)

1. https://developers.tosspayments.com → 가입
2. 테스트 → 시크릿 키/클라이언트 키 복사
3. 위 환경변수에 입력
4. 결제 후 리다이렉트 URL 등록:
   - `https://signal-edu.vercel.app/payment`

---

## 6단계: 배포 후 확인

```bash
# 백엔드 헬스체크
curl https://signal-edu-backend.up.railway.app/health

# API 문서
https://signal-edu-backend.up.railway.app/docs
```

### 테스트 시나리오
- [ ] 회원가입 → 로그인
- [ ] 수시 시뮬레이터 필터·선택·저장
- [ ] 정시 계산기 수능 점수 입력
- [ ] AI 학종 평가 텍스트 입력 → Claude 응답
- [ ] 면접 모의 연습 → AI 피드백
- [ ] 결제 테스트 (토스 테스트 카드)

---

## 로컬 개발 재시작

```bash
# 프론트엔드 (터미널 1)
npm install && npm run dev

# 백엔드 (터미널 2)
cd backend && source venv/bin/activate
cd .. && uvicorn backend.main:app --reload --port 8000

# DB 초기화 (처음 한 번)
python -m backend.scripts.seed_db
```

---

## 월 운영비 예상

| 서비스 | 무료 한도 | 초과 시 |
|--------|-----------|---------|
| Vercel (프론트) | 무료 | $20/월 |
| Railway (백엔드) | $5 크레딧 | $5~20/월 |
| Supabase (DB·인증) | 무료 | $25/월 |
| Claude API | - | 사용량×요금 |
| 토스페이먼츠 | 무료 | 3.3% 수수료 |
| **합계** | **거의 무료** | **약 3~7만원/월** |
