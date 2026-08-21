from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta

from database import db
from models import (
    Content, ContentCreate, ContentUpdate,
    ProgressLog, ProgressLogCreate,
    FitnessLog, FitnessLogCreate, now_iso,
)

router = APIRouter(tags=["growth"])

DEFAULT_UNITS = {
    "book": "pages",
    "film": "minutes",
    "podcast": "minutes",
    "course": "lessons",
}
TIME_BASED_TYPES = {"film", "podcast"}  # increments counted as study minutes


# ------------------------- Content Library -------------------------
@router.get("/content", response_model=List[Content])
async def list_content(status: Optional[str] = None, type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    docs = await db.content_library.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@router.post("/content", response_model=Content)
async def create_content(payload: ContentCreate):
    data = payload.model_dump()
    if not data.get("unit_label"):
        data["unit_label"] = DEFAULT_UNITS.get(data["type"], "units")
    content = Content(**data)
    if content.status == "BACKLOG" and content.current_progress > 0:
        content.status = "IN_PROGRESS"
    await db.content_library.insert_one(content.model_dump())
    return content


@router.put("/content/{content_id}", response_model=Content)
async def update_content(content_id: str, payload: ContentUpdate):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update:
        await db.content_library.update_one({"id": content_id}, {"$set": update})
    doc = await db.content_library.find_one({"id": content_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    return doc


@router.delete("/content/{content_id}")
async def delete_content(content_id: str):
    await db.content_library.delete_one({"id": content_id})
    await db.progress_logs.delete_many({"content_id": content_id})
    return {"ok": True}


# ------------------------- Progress Logs -------------------------
@router.post("/content/{content_id}/log", response_model=ProgressLog)
async def add_progress(content_id: str, payload: ProgressLogCreate):
    content = await db.content_library.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    log_date = payload.date or datetime.utcnow().strftime("%Y-%m-%d")
    log = ProgressLog(
        content_id=content_id,
        content_title=content["title"],
        content_type=content["type"],
        increment=payload.increment,
        note=payload.note or "",
        unit_label=content.get("unit_label", "units"),
        date=log_date,
    )
    await db.progress_logs.insert_one(log.model_dump())

    # Update content progress
    new_progress = content.get("current_progress", 0) + payload.increment
    total = content.get("total_units", 0)
    if total > 0:
        new_progress = min(new_progress, total)
    new_status = content.get("status", "BACKLOG")
    if total > 0 and new_progress >= total:
        new_status = "COMPLETED"
    elif new_progress > 0:
        new_status = "IN_PROGRESS"
    await db.content_library.update_one(
        {"id": content_id},
        {"$set": {"current_progress": new_progress, "status": new_status}},
    )
    return log


@router.get("/progress-logs", response_model=List[ProgressLog])
async def list_progress_logs(content_id: Optional[str] = None, limit: int = 100):
    query = {}
    if content_id:
        query["content_id"] = content_id
    docs = await db.progress_logs.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


# ------------------------- Fitness Logs -------------------------
@router.get("/fitness", response_model=List[FitnessLog])
async def list_fitness(limit: int = 100):
    docs = await db.fitness_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@router.post("/fitness", response_model=FitnessLog)
async def create_fitness(payload: FitnessLogCreate):
    data = payload.model_dump()
    if not data.get("date"):
        data["date"] = datetime.utcnow().strftime("%Y-%m-%d")
    log = FitnessLog(**data)
    await db.fitness_logs.insert_one(log.model_dump())
    return log


@router.delete("/fitness/{log_id}")
async def delete_fitness(log_id: str):
    await db.fitness_logs.delete_one({"id": log_id})
    return {"ok": True}


# ------------------------- Growth Dashboard -------------------------
def _week_dates(week_start: str) -> List[str]:
    d = datetime.strptime(week_start, "%Y-%m-%d")
    return [(d + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]


@router.get("/dashboard/growth")
async def growth_dashboard(week_start: str):
    dates = _week_dates(week_start)
    date_set = set(dates)

    progress_logs = await db.progress_logs.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)
    fitness_logs = await db.fitness_logs.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)
    tasks = await db.daily_tasks.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)

    study_minutes = sum(
        l["increment"] for l in progress_logs if l.get("content_type") in TIME_BASED_TYPES
    )
    exercise_minutes = sum(l.get("duration_min", 0) for l in fitness_logs)
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.get("completed")])
    completion_rate = round((completed_tasks / total_tasks) * 100) if total_tasks else 0

    # Per-day breakdown for charts
    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    per_day = []
    for i, dt in enumerate(dates):
        day_study = sum(
            l["increment"] for l in progress_logs
            if l.get("date") == dt and l.get("content_type") in TIME_BASED_TYPES
        )
        day_exercise = sum(l.get("duration_min", 0) for l in fitness_logs if l.get("date") == dt)
        day_completed = len([t for t in tasks if t.get("date") == dt and t.get("completed")])
        per_day.append({
            "day": day_labels[i],
            "date": dt,
            "study": day_study,
            "exercise": day_exercise,
            "completed": day_completed,
        })

    # Streak: consecutive days (ending today) with any activity
    all_progress = await db.progress_logs.find({}, {"_id": 0, "date": 1}).to_list(20000)
    all_fitness = await db.fitness_logs.find({}, {"_id": 0, "date": 1}).to_list(20000)
    all_tasks = await db.daily_tasks.find({"completed": True}, {"_id": 0, "date": 1}).to_list(20000)
    active_days = set()
    for coll in (all_progress, all_fitness, all_tasks):
        for x in coll:
            if x.get("date"):
                active_days.add(x["date"])
    streak = 0
    cursor = datetime.utcnow()
    while cursor.strftime("%Y-%m-%d") in active_days:
        streak += 1
        cursor -= timedelta(days=1)

    return {
        "streak": streak,
        "study_minutes": study_minutes,
        "exercise_minutes": exercise_minutes,
        "completion_rate": completion_rate,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks,
        "per_day": per_day,
    }
