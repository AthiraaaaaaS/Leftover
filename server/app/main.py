"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, donations, tasks, maps


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed demo data on startup."""
    await init_db()
    from app.database import AsyncSessionLocal
    from app.models import Donation
    from sqlalchemy import select, func
    from app.seed import seed_demo_data

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count()).select_from(Donation))
        count = result.scalar_one() or 0
        if count == 0:
            await seed_demo_data(session)
            await session.commit()
    yield


app = FastAPI(
    title=settings.app_name,
    description="LeftoverLink API - Food donation and volunteer pickup coordination",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(donations.router)
app.include_router(tasks.router)
app.include_router(maps.router)


@app.get("/")
async def root():
    """Health/root endpoint."""
    return {"message": "LeftoverLink API", "docs": "/docs", "openapi": "/openapi.json"}


@app.post("/demo/reset")
async def reset_demo():
    """Reset demo data. In development only; clears and reseeds donations and tasks."""
    from app.models import Donation, Task
    from sqlalchemy import delete
    from app.database import AsyncSessionLocal
    from app.seed import seed_demo_data

    async with AsyncSessionLocal() as session:
        await session.execute(delete(Task))
        await session.execute(delete(Donation))
        await session.commit()

    async with AsyncSessionLocal() as session:
        await seed_demo_data(session)
        await session.commit()

    return {"ok": True, "message": "Demo data reset"}


@app.post("/auth/reset-demo")
async def reset_auth_demo():
    """Reset auth demo - clears users. Development only."""
    from app.models import User
    from app.database import AsyncSessionLocal
    from sqlalchemy import delete

    async with AsyncSessionLocal() as session:
        await session.execute(delete(User))
        await session.commit()

    return {"ok": True, "message": "Auth demo reset"}
