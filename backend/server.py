from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import os
import logging

from database import db
from routes_planner import router as planner_router
from routes_growth import router as growth_router
from routes_review import router as review_router

app = FastAPI(title="Personal Growth & LifeOS API")

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Personal Growth & LifeOS API"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# Include feature routers
api_router.include_router(planner_router)
api_router.include_router(growth_router)
api_router.include_router(review_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    # Helpful indexes
    await db.daily_tasks.create_index("date")
    await db.weekly_milestones.create_index("week_start")
    await db.monthly_goals.create_index("month")
    await db.progress_logs.create_index("date")
    await db.fitness_logs.create_index("date")
    logger.info("Startup complete: indexes ensured.")


@app.on_event("shutdown")
async def shutdown_db_client():
    from database import client
    client.close()
