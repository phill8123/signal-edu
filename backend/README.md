# SIGnAL EDU — Backend API

FastAPI + SQLAlchemy + PostgreSQL

## 로컬 실행

```bash
cd backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일 편집 (DB URL, API 키 등)

# 서버 실행 (프로젝트 루트에서)
cd ..
uvicorn backend.main:app --reload --port 8000
```

API 문서: `http://localhost:8000/docs`

---

## SQLite 로컬 개발 (PostgreSQL 없이)

`.env`에서 DATABASE_URL을 기본값으로 두면 SQLite를 사용합니다:
```
DATABASE_URL=sqlite+aiosqlite:///./signal_edu.db
```
SQLite용 추가 패키지:
```bash
pip install aiosqlite
```

---

## DB 초기 데이터 삽입

```bash
python -m backend.scripts.seed_db
```

---

## Railway 배포

1. Railway.app → New Project → Deploy from GitHub
2. Root Directory: `/` (전체 repo)
3. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. 환경변수 설정: DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY

---

## API 엔드포인트 요약

| Method | Path | 설명 |
|--------|------|------|
| POST | /auth/signup | 회원가입 |
| POST | /auth/login | 로그인 |
| GET  | /auth/me | 내 정보 |
| GET  | /students/ | 학생 목록 |
| POST | /students/ | 학생 생성 |
| PATCH| /students/{id} | 학생 수정 (선택 전형 저장) |
| GET  | /majors/ | 전형 목록 (필터 지원) |
| GET  | /majors/{id} | 전형 상세 (4개년 데이터) |
| POST | /ai-eval/ | AI 학종 평가 |
| GET  | /ai-eval/history | 평가 이력 |
| GET  | /health | 서버 상태 확인 |
