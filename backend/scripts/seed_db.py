"""
초기 전형 DB 데이터를 DB에 삽입합니다.
실행: python -m backend.scripts.seed_db
"""
import asyncio, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from backend.core.database import AsyncSessionLocal, init_db
from backend.models.models import Major, YearDetail

MAJORS = [
    # ── 서울대 ──
    dict(id='s01', univ='서울대', jt='종합', jeon='지역균형전형', major='인문계열',     gye='문과', cat='인문',    경쟁률=4.81,  g50=1.20, g70=1.31, year=2025),
    dict(id='s02', univ='서울대', jt='종합', jeon='지역균형전형', major='경영대학',     gye='통합', cat='경영경제', 경쟁률=2.42,  g50=1.12, g70=1.18, year=2025),
    dict(id='s03', univ='서울대', jt='종합', jeon='지역균형전형', major='경제학부',     gye='통합', cat='경영경제', 경쟁률=2.33,  g50=1.09, g70=1.18, year=2025),
    dict(id='s04', univ='서울대', jt='종합', jeon='지역균형전형', major='사회학과',     gye='문과', cat='사회과학', 경쟁률=4.33,  g50=1.03, g70=1.07, year=2025),
    dict(id='s05', univ='서울대', jt='종합', jeon='지역균형전형', major='정치외교학부', gye='문과', cat='사회과학', 경쟁률=3.35,  g50=1.12, g70=1.13, year=2025),
    dict(id='s06', univ='서울대', jt='종합', jeon='지역균형전형', major='수리과학부',   gye='이과', cat='자연과학', 경쟁률=4.00,  g50=1.19, g70=1.26, year=2025),
    dict(id='s10', univ='서울대', jt='종합', jeon='지역균형전형', major='기계공학부',   gye='이과', cat='공학',    경쟁률=3.69,  g50=1.26, g70=1.31, year=2025),
    dict(id='s11', univ='서울대', jt='종합', jeon='지역균형전형', major='전기정보공학부', gye='이과', cat='공학',  경쟁률=4.73,  g50=1.11, g70=1.16, year=2025),
    dict(id='s12', univ='서울대', jt='종합', jeon='지역균형전형', major='컴퓨터공학부', gye='이과', cat='공학',    경쟁률=6.83,  g50=1.07, g70=1.10, year=2025),
    dict(id='s14', univ='서울대', jt='종합', jeon='지역균형전형', major='간호대학',     gye='의약', cat='의약보건', 경쟁률=8.20,  g50=1.52, g70=1.56, year=2025),
    dict(id='s19', univ='서울대', jt='종합', jeon='일반전형',     major='의예과',       gye='의약', cat='의약보건', 경쟁률=21.40, g50=None, g70=None, year=2025),
    # ── 연세대 ──
    dict(id='y01', univ='연세대', jt='종합', jeon='활동우수형',   major='경영학과',     gye='통합', cat='경영경제', 경쟁률=8.29,  g50=1.79, g70=1.92, year=2025),
    dict(id='y03', univ='연세대', jt='종합', jeon='활동우수형',   major='컴퓨터과학과', gye='이과', cat='공학',    경쟁률=13.91, g50=1.33, g70=1.36, year=2025),
    dict(id='y04', univ='연세대', jt='종합', jeon='활동우수형',   major='인공지능학과', gye='이과', cat='공학',    경쟁률=14.15, g50=1.60, g70=1.69, year=2025),
    dict(id='y05', univ='연세대', jt='종합', jeon='활동우수형',   major='전기전자공학부', gye='이과', cat='공학',  경쟁률=9.97,  g50=1.55, g70=1.67, year=2025),
    dict(id='y11', univ='연세대', jt='종합', jeon='활동우수형',   major='의예과',       gye='의약', cat='의약보건', 경쟁률=11.33, g50=1.12, g70=1.18, year=2025),
    dict(id='y12', univ='연세대', jt='종합', jeon='활동우수형',   major='치의예과',     gye='의약', cat='의약보건', 경쟁률=17.25, g50=1.31, g70=1.49, year=2025),
    dict(id='y19', univ='연세대', jt='교과', jeon='추천형',       major='경영학과',     gye='통합', cat='경영경제', 경쟁률=4.30,  g50=1.32, g70=1.44, year=2025),
    dict(id='y21', univ='연세대', jt='교과', jeon='추천형',       major='의예과',       gye='의약', cat='의약보건', 경쟁률=6.50,  g50=1.00, g70=1.03, year=2025),
    dict(id='y24', univ='연세대', jt='교과', jeon='추천형',       major='컴퓨터과학과', gye='이과', cat='공학',    경쟁률=4.45,  g50=1.28, g70=1.31, year=2025),
    # ── 고려대 ──
    dict(id='k02', univ='고려대', jt='종합', jeon='학업우수전형', major='경영대학',     gye='통합', cat='경영경제', 경쟁률=9.27,  g50=2.15, g70=2.38, year=2025),
    dict(id='k03', univ='고려대', jt='종합', jeon='학업우수전형', major='컴퓨터학과',   gye='이과', cat='공학',    경쟁률=11.94, g50=1.67, g70=None, year=2025),
    dict(id='k16', univ='고려대', jt='교과', jeon='학교추천전형', major='의과대학',     gye='의약', cat='의약보건', 경쟁률=23.44, g50=1.06, g70=1.08, year=2025),
    dict(id='k17', univ='고려대', jt='교과', jeon='학교추천전형', major='경영대학',     gye='통합', cat='경영경제', 경쟁률=5.13,  g50=1.35, g70=1.39, year=2025),
    dict(id='k18', univ='고려대', jt='교과', jeon='학교추천전형', major='컴퓨터학과',   gye='이과', cat='공학',    경쟁률=10.86, g50=1.27, g70=1.34, year=2025),
    dict(id='k19', univ='고려대', jt='교과', jeon='학교추천전형', major='전기전자공학부', gye='이과', cat='공학',  경쟁률=7.51,  g50=1.30, g70=1.32, year=2025),
    # ── 성균관대 ──
    dict(id='sk01', univ='성균관대', jt='종합', jeon='탐구형인재전형', major='반도체시스템공학', gye='이과', cat='공학',    경쟁률=18.2, g50=1.42, g70=1.58, year=2025),
    dict(id='sk02', univ='성균관대', jt='종합', jeon='탐구형인재전형', major='소프트웨어학',     gye='이과', cat='공학',    경쟁률=15.4, g50=1.38, g70=1.55, year=2025),
    dict(id='sk03', univ='성균관대', jt='교과', jeon='학교장추천전형', major='경영학',          gye='통합', cat='경영경제', 경쟁률=6.8,  g50=1.52, g70=1.63, year=2025),
    dict(id='sk04', univ='성균관대', jt='교과', jeon='학교장추천전형', major='의예과',          gye='의약', cat='의약보건', 경쟁률=22.1, g50=1.10, g70=1.15, year=2025),
    # ── 한양대 ──
    dict(id='hy01', univ='한양대', jt='종합', jeon='서류형(학생부종합)', major='컴퓨터소프트웨어', gye='이과', cat='공학',    경쟁률=12.3, g50=1.65, g70=1.82, year=2025),
    dict(id='hy02', univ='한양대', jt='교과', jeon='지역균형발전전형',  major='경영학부',         gye='통합', cat='경영경제', 경쟁률=5.2,  g50=1.58, g70=1.72, year=2025),
    dict(id='hy03', univ='한양대', jt='교과', jeon='지역균형발전전형',  major='의예과',           gye='의약', cat='의약보건', 경쟁률=19.8, g50=1.12, g70=1.18, year=2025),
    # ── 서강대 ──
    dict(id='sg01', univ='서강대', jt='종합', jeon='일반형',           major='컴퓨터공학·AI',   gye='이과', cat='공학',    경쟁률=16.5, g50=1.72, g70=1.91, year=2025),
    dict(id='sg02', univ='서강대', jt='종합', jeon='일반형',           major='경영학',          gye='통합', cat='경영경제', 경쟁률=9.8,  g50=1.85, g70=2.05, year=2025),
    dict(id='sg03', univ='서강대', jt='교과', jeon='학교장추천전형',   major='경제학',          gye='통합', cat='경영경제', 경쟁률=4.9,  g50=1.62, g70=1.78, year=2025),
    # ── 이화여대 ──
    dict(id='ew01', univ='이화여대', jt='종합', jeon='미래인재전형',   major='컴퓨터공학과',    gye='이과', cat='공학',    경쟁률=11.2, g50=1.88, g70=2.12, year=2025),
    dict(id='ew02', univ='이화여대', jt='종합', jeon='미래인재전형',   major='의예과',          gye='의약', cat='의약보건', 경쟁률=20.4, g50=1.15, g70=1.22, year=2025),
    dict(id='ew03', univ='이화여대', jt='교과', jeon='고교추천전형',   major='경영학부',        gye='통합', cat='경영경제', 경쟁률=5.8,  g50=1.70, g70=1.85, year=2025),
    # ── 중앙대 ──
    dict(id='ju01', univ='중앙대', jt='종합', jeon='CAU융합형인재전형', major='국어국문학과',   gye='문과', cat='인문',    경쟁률=11.7, g50=1.92, g70=1.94, year=2025),
    dict(id='ju02', univ='중앙대', jt='종합', jeon='다빈치형인재전형',  major='소프트웨어학부', gye='이과', cat='공학',    경쟁률=14.8, g50=1.95, g70=2.18, year=2025),
    dict(id='ju03', univ='중앙대', jt='교과', jeon='학교장추천전형',   major='경영학부',       gye='통합', cat='경영경제', 경쟁률=7.2,  g50=1.82, g70=1.96, year=2025),
    # ── 경희대 ──
    dict(id='kh01', univ='경희대', jt='종합', jeon='네오르네상스전형', major='한의예과',       gye='의약', cat='의약보건', 경쟁률=25.3, g50=1.35, g70=1.42, year=2025),
    dict(id='kh02', univ='경희대', jt='종합', jeon='네오르네상스전형', major='의예과',         gye='의약', cat='의약보건', 경쟁률=28.7, g50=1.18, g70=1.25, year=2025),
    dict(id='kh03', univ='경희대', jt='교과', jeon='지역균형전형',     major='소프트웨어융합', gye='이과', cat='공학',    경쟁률=8.4,  g50=2.05, g70=2.22, year=2025),
]

YEAR_DETAILS = [
    dict(major_id='k16', yr=2025, 모집=18, 충원=6,  경쟁률=23.44, g50=1.06, g70=1.08, 환산50=79.91, 환산70=79.88),
    dict(major_id='k16', yr=2024, 모집=18, 충원=5,  경쟁률=22.80, g50=1.07, g70=1.09, 환산50=79.88, 환산70=79.85),
    dict(major_id='k16', yr=2023, 모집=17, 충원=7,  경쟁률=24.10, g50=1.08, g70=1.10, 환산50=79.85, 환산70=79.82),
    dict(major_id='k16', yr=2022, 모집=16, 충원=6,  경쟁률=21.50, g50=1.10, g70=1.12, 환산50=79.80, 환산70=79.76),
    dict(major_id='y03', yr=2025, 모집=11, 충원=5,  경쟁률=13.91, g50=1.33, g70=1.36, 환산50=None,  환산70=None),
    dict(major_id='y03', yr=2024, 모집=10, 충원=4,  경쟁률=14.20, g50=1.35, g70=1.38, 환산50=None,  환산70=None),
    dict(major_id='y03', yr=2023, 모집=12, 충원=4,  경쟁률=12.80, g50=1.37, g70=1.41, 환산50=None,  환산70=None),
    dict(major_id='y03', yr=2022, 모집=11, 충원=3,  경쟁률=11.60, g50=1.39, g70=1.43, 환산50=None,  환산70=None),
    dict(major_id='k17', yr=2025, 모집=55, 충원=18, 경쟁률=5.13,  g50=1.35, g70=1.39, 환산50=79.45, 환산70=79.28),
    dict(major_id='k17', yr=2024, 모집=54, 충원=16, 경쟁률=5.30,  g50=1.37, g70=1.41, 환산50=79.40, 환산70=79.22),
    dict(major_id='k17', yr=2023, 모집=55, 충원=14, 경쟁률=4.90,  g50=1.39, g70=1.43, 환산50=79.36, 환산70=79.18),
    dict(major_id='k17', yr=2022, 모집=52, 충원=15, 경쟁률=4.60,  g50=1.41, g70=1.46, 환산50=79.30, 환산70=79.12),
]

async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        count = await session.execute(select(func.count(Major.id)))
        if (count.scalar() or 0) > 0:
            print("이미 데이터가 있습니다. 건너뜁니다.")
            return
        for m in MAJORS:
            session.add(Major(**m))
        for yd in YEAR_DETAILS:
            session.add(YearDetail(**yd))
        await session.commit()
        print(f"전형 {len(MAJORS)}개, 연도별 상세 {len(YEAR_DETAILS)}개 삽입 완료")

if __name__ == "__main__":
    asyncio.run(seed())
