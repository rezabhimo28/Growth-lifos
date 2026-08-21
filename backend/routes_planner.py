from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta

from database import db
from models import (
    MonthlyGoal, MonthlyGoalCreate, MonthlyGoalUpdate,
    Milestone, MilestoneCreate, MilestoneUpdate,
    Task, TaskCreate, TaskUpdate, RolloverRequest, now_iso,
)

router = APIRouter(tags=["planner"])


def clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


# ------------------------- Monthly Goals -------------------------
@router.get("/goals", response_model=List[MonthlyGoal])
async def list_goals(month: Optional[str] = None):
    query = {}
    if month:
        query["month"] = month
    docs = await db.monthly_goals.find(query, {"_id": 0}).sort("order", 1).to_list(1000)
    return docs


@router.post("/goals", response_model=MonthlyGoal)
async def create_goal(payload: MonthlyGoalCreate):
    existing = await db.monthly_goals.count_documents({"month": payload.month})
    if existing >= 3:
        raise HTTPException(status_code=400, detail="Maximum of 3 monthly goals allowed for this month.")
    goal = MonthlyGoal(**payload.model_dump(), order=existing)
    await db.monthly_goals.insert_one(goal.model_dump())
    return goal


@router.put("/goals/{goal_id}", response_model=MonthlyGoal)
async def update_goal(goal_id: str, payload: MonthlyGoalUpdate):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.monthly_goals.update_one({"id": goal_id}, {"$set": update})
    doc = await db.monthly_goals.find_one({"id": goal_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Goal not found")
    return doc


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str):
    await db.monthly_goals.delete_one({"id": goal_id})
    await db.weekly_milestones.update_many({"goal_id": goal_id}, {"$set": {"goal_id": None}})
    return {"ok": True}


# ------------------------- Weekly Milestones -------------------------
@router.get("/milestones", response_model=List[Milestone])
async def list_milestones(week_start: Optional[str] = None, goal_id: Optional[str] = None):
    query = {}
    if week_start:
        query["week_start"] = week_start
    if goal_id:
        query["goal_id"] = goal_id
    docs = await db.weekly_milestones.find(query, {"_id": 0}).sort("order", 1).to_list(1000)
    return docs


@router.post("/milestones", response_model=Milestone)
async def create_milestone(payload: MilestoneCreate):
    count = await db.weekly_milestones.count_documents({"week_start": payload.week_start})
    milestone = Milestone(**payload.model_dump(), order=count)
    await db.weekly_milestones.insert_one(milestone.model_dump())
    return milestone


@router.put("/milestones/{milestone_id}", response_model=Milestone)
async def update_milestone(milestone_id: str, payload: MilestoneUpdate):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.weekly_milestones.update_one({"id": milestone_id}, {"$set": update})
    doc = await db.weekly_milestones.find_one({"id": milestone_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return doc


@router.delete("/milestones/{milestone_id}")
async def delete_milestone(milestone_id: str):
    await db.weekly_milestones.delete_one({"id": milestone_id})
    return {"ok": True}


# ------------------------- Daily Tasks -------------------------
TIER_LIMITS = {"big_win": 1, "medium": 3, "quick": 5}


@router.get("/tasks", response_model=List[Task])
async def list_tasks(date: Optional[str] = None, backlog: Optional[bool] = None):
    query = {}
    if backlog:
        query["date"] = "backlog"
    elif date:
        query["date"] = date
    docs = await db.daily_tasks.find(query, {"_id": 0}).sort("order", 1).to_list(2000)
    return docs


@router.post("/tasks", response_model=Task)
async def create_task(payload: TaskCreate):
    if payload.date != "backlog":
        count = await db.daily_tasks.count_documents({"date": payload.date, "tier": payload.tier})
        limit = TIER_LIMITS.get(payload.tier, 99)
        if count >= limit:
            tier_name = {"big_win": "Big Win", "medium": "Medium", "quick": "Quick"}[payload.tier]
            raise HTTPException(status_code=400, detail=f"1-3-5 rule: only {limit} {tier_name} task(s) allowed per day.")
    order = await db.daily_tasks.count_documents({"date": payload.date})
    task = Task(**payload.model_dump(), order=order)
    await db.daily_tasks.insert_one(task.model_dump())
    return task


@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, payload: TaskUpdate):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update:
        await db.daily_tasks.update_one({"id": task_id}, {"$set": update})
    doc = await db.daily_tasks.find_one({"id": task_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return doc


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    await db.daily_tasks.delete_one({"id": task_id})
    return {"ok": True}


@router.get("/tasks/rollover-candidates", response_model=List[Task])
async def rollover_candidates(date: str):
    """Incomplete tasks for a given date that could be rolled over."""
    docs = await db.daily_tasks.find(
        {"date": date, "completed": False}, {"_id": 0}
    ).sort("order", 1).to_list(1000)
    return docs


@router.post("/tasks/rollover")
async def rollover_tasks(payload: RolloverRequest):
    if payload.target == "tomorrow":
        try:
            d = datetime.strptime(payload.from_date, "%Y-%m-%d")
            target_date = (d + timedelta(days=1)).strftime("%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid from_date")
    else:
        target_date = "backlog"
    result = await db.daily_tasks.update_many(
        {"id": {"$in": payload.task_ids}},
        {"$set": {"date": target_date}},
    )
    return {"ok": True, "moved": result.modified_count, "target_date": target_date}
