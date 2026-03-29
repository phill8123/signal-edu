from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.config import settings
from .core.database import init_db
from .routers import auth, students, majors, ai_eval, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="SIGnAL EDU API",
    version="0.4.0",
    description="AI 대학입시 컨설팅 플랫폼 백엔드 API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(majors.router)
app.include_router(ai_eval.router)
app.include_router(payments.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.4.0"}
