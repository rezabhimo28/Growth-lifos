from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime, timedelta

from database import db
from models import WeeklyReview, WeeklyReviewSave, Settings, SettingsUpdate, Task, now_iso

router = APIRouter(tags=["review"])

TIME_BASED_TYPES = {"film", "podcast"}


def _week_dates(week_start: str) -> List[str]:
    d = datetime.strptime(week_start, "%Y-%m-%d")
    return [(d + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]


# ------------------------- Weekly Review -------------------------
@router.get("/weekly-review")
async def get_review(week_start: str):
    doc = await db.weekly_reviews.find_one({"week_start": week_start}, {"_id": 0})
    if not doc:
        review = WeeklyReview(week_start=week_start)
        await db.weekly_reviews.insert_one(review.model_dump())
        return review.model_dump()
    return doc


@router.post("/weekly-review")
async def save_review(payload: WeeklyReviewSave):
    existing = await db.weekly_reviews.find_one({"week_start": payload.week_start}, {"_id": 0})
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if k != "week_start"}
    update["updated_at"] = now_iso()
    if not existing:
        review = WeeklyReview(week_start=payload.week_start)
        merged = {**review.model_dump(), **update}
        await db.weekly_reviews.insert_one(merged)
        return {k: v for k, v in merged.items() if k != "_id"}
    await db.weekly_reviews.update_one({"week_start": payload.week_start}, {"$set": update})
    doc = await db.weekly_reviews.find_one({"week_start": payload.week_start}, {"_id": 0})
    return doc


@router.get("/weekly-review/summary")
async def review_summary(week_start: str):
    dates = _week_dates(week_start)
    progress_logs = await db.progress_logs.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)
    fitness_logs = await db.fitness_logs.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)
    tasks = await db.daily_tasks.find({"date": {"$in": dates}}, {"_id": 0}).to_list(5000)

    study_minutes = sum(l["increment"] for l in progress_logs if l.get("content_type") in TIME_BASED_TYPES)
    reading_units = sum(l["increment"] for l in progress_logs if l.get("content_type") == "book")
    exercise_minutes = sum(l.get("duration_min", 0) for l in fitness_logs)
    completed_tasks = len([t for t in tasks if t.get("completed")])
    total_tasks = len(tasks)

    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    per_day = []
    for i, dt in enumerate(dates):
        per_day.append({
            "day": day_labels[i],
            "completed": len([t for t in tasks if t.get("date") == dt and t.get("completed")]),
            "study": sum(l["increment"] for l in progress_logs if l.get("date") == dt and l.get("content_type") in TIME_BASED_TYPES),
            "exercise": sum(l.get("duration_min", 0) for l in fitness_logs if l.get("date") == dt),
        })

    return {
        "study_minutes": study_minutes,
        "reading_units": reading_units,
        "exercise_minutes": exercise_minutes,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks,
        "per_day": per_day,
    }


@router.get("/weekly-review/pending-tasks", response_model=List[Task])
async def pending_tasks(week_start: str):
    """Incomplete tasks from the given week + backlog, candidates to carry forward."""
    dates = _week_dates(week_start)
    docs = await db.daily_tasks.find(
        {"completed": False, "date": {"$in": dates + ["backlog"]}}, {"_id": 0}
    ).to_list(2000)
    return docs


# ------------------------- Settings -------------------------
@router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one(s.model_dump())
        return s
    return doc


# ------------------------- Data Export -------------------------
@router.get("/export")
async def export_data():
    """Export all user data as a single JSON payload for backup."""
    collections = [
        "monthly_goals", "weekly_milestones", "daily_tasks",
        "content_library", "progress_logs", "fitness_logs",
        "weekly_reviews", "settings",
    ]
    data = {}
    for name in collections:
        docs = await db[name].find({}, {"_id": 0}).to_list(100000)
        data[name] = docs
    return {
        "app": "Personal Growth & LifeOS",
        "exported_at": now_iso(),
        "version": 1,
        "collections": data,
    }


@router.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    existing = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if not existing:
        s = Settings(**update)
        await db.settings.insert_one(s.model_dump())
        return s
    if update:
        await db.settings.update_one({"id": "default"}, {"$set": update})
    doc = await db.settings.find_one({"id": "default"}, {"_id": 0})
    return doc
