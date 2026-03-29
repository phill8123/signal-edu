#!/bin/bash
# SIGnAL EDU 배포 스크립트
# 사용법: ./deploy.sh [frontend|backend|all]

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${BLUE}[SIGnAL EDU]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠${NC} $1"; }

TARGET=${1:-all}

# ── 환경변수 체크 ──────────────────────────
check_env() {
  log "환경변수 확인 중..."
  local missing=0

  [ -z "$VITE_API_URL" ]             && warn "VITE_API_URL 미설정" && missing=1
  [ -z "$VITE_SUPABASE_URL" ]        && warn "VITE_SUPABASE_URL 미설정 (카카오 로그인 불가)"
  [ -z "$VITE_TOSS_CLIENT_KEY" ]     && warn "VITE_TOSS_CLIENT_KEY 미설정 (결제 불가)"

  [ $missing -eq 1 ] && echo "필수 환경변수를 .env.local에 설정해주세요." && exit 1
  ok "환경변수 확인 완료"
}

# ── 프론트엔드 빌드 & Vercel 배포 ──────────
deploy_frontend() {
  log "프론트엔드 빌드 중..."
  npm run build
  ok "빌드 완료 (dist/ 폴더)"

  if command -v vercel &> /dev/null; then
    log "Vercel 배포 중..."
    vercel --prod --yes
    ok "Vercel 배포 완료"
  else
    warn "vercel CLI 없음. npm install -g vercel 후 vercel deploy 실행하세요."
  fi
}

# ── 백엔드 Railway 배포 ─────────────────────
deploy_backend() {
  log "백엔드 배포 준비 확인..."

  if ! command -v railway &> /dev/null; then
    warn "Railway CLI 없음."
    echo "설치: npm install -g @railway/cli"
    echo "로그인: railway login"
    echo "배포: railway up"
    return
  fi

  log "Railway 배포 중..."
  railway up
  ok "Railway 배포 완료"

  log "DB 시딩 중..."
  railway run python -m backend.scripts.seed_db
  ok "DB 초기 데이터 삽입 완료"
}

# ── 메인 ───────────────────────────────────
case $TARGET in
  frontend)
    check_env
    deploy_frontend
    ;;
  backend)
    deploy_backend
    ;;
  all)
    check_env
    deploy_frontend
    deploy_backend
    ;;
  *)
    echo "사용법: ./deploy.sh [frontend|backend|all]"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  SIGnAL EDU 배포 완료!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
