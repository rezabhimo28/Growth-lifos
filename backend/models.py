from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timezone
import uuid


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def gen_id() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Monthly Goals
# ---------------------------------------------------------------------------
class MonthlyGoalCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    month: str  # format YYYY-MM
    color: Optional[str] = "emerald"


class MonthlyGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    month: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None


class MonthlyGoal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    description: str = ""
    month: str
    color: str = "emerald"
    order: int = 0
    created_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Weekly Milestones
# ---------------------------------------------------------------------------
class MilestoneCreate(BaseModel):
    title: str
    goal_id: Optional[str] = None
    week_start: str  # YYYY-MM-DD (Monday)


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    goal_id: Optional[str] = None
    week_start: Optional[str] = None
    completed: Optional[bool] = None
    order: Optional[int] = None


class Milestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    goal_id: Optional[str] = None
    week_start: str
    completed: bool = False
    order: int = 0
    created_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Daily Tasks (1-3-5 rule)
# ---------------------------------------------------------------------------
TaskTier = Literal["big_win", "medium", "quick"]


class TaskCreate(BaseModel):
    title: str
    tier: TaskTier
    date: str  # YYYY-MM-DD
    milestone_id: Optional[str] = None
    start_time: Optional[str] = None  # HH:MM
    end_time: Optional[str] = None    # HH:MM


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    tier: Optional[TaskTier] = None
    date: Optional[str] = None
    completed: Optional[bool] = None
    milestone_id: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    order: Optional[int] = None


class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    tier: TaskTier
    date: str
    completed: bool = False
    milestone_id: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    order: int = 0
    created_at: str = Field(default_factory=now_iso)


class RolloverRequest(BaseModel):
    task_ids: List[str]
    target: Literal["tomorrow", "backlog"] = "tomorrow"
    from_date: str


# ---------------------------------------------------------------------------
# Content Library (polymorphic tracker)
# ---------------------------------------------------------------------------
ContentType = Literal["book", "film", "podcast", "course"]
ContentStatus = Literal["BACKLOG", "IN_PROGRESS", "COMPLETED"]


class ContentCreate(BaseModel):
    title: str
    type: ContentType
    status: ContentStatus = "BACKLOG"
    total_units: int = 0
    current_progress: int = 0
    unit_label: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    rating: Optional[int] = None


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[ContentType] = None
    status: Optional[ContentStatus] = None
    total_units: Optional[int] = None
    current_progress: Optional[int] = None
    unit_label: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    rating: Optional[int] = None


class Content(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    type: ContentType
    status: ContentStatus = "BACKLOG"
    total_units: int = 0
    current_progress: int = 0
    unit_label: str = "units"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    rating: Optional[int] = None
    created_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Progress Log
# ---------------------------------------------------------------------------
class ProgressLogCreate(BaseModel):
    content_id: str
    increment: int
    note: Optional[str] = ""  # Active Recall Hook
    date: Optional[str] = None  # YYYY-MM-DD


class ProgressLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    content_id: str
    content_title: str = ""
    content_type: str = ""
    increment: int
    note: str = ""
    unit_label: str = "units"
    date: str
    created_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Fitness Log
# ---------------------------------------------------------------------------
class FitnessLogCreate(BaseModel):
    activity: str
    duration_min: int
    metrics: Dict[str, Any] = Field(default_factory=dict)  # sets/reps/distance
    note: Optional[str] = ""
    date: Optional[str] = None


class FitnessLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    activity: str
    duration_min: int
    metrics: Dict[str, Any] = Field(default_factory=dict)
    note: str = ""
    date: str
    created_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Weekly Review
# ---------------------------------------------------------------------------
class WeeklyReviewSave(BaseModel):
    week_start: str
    step: Optional[int] = 0
    reflections: Optional[Dict[str, str]] = None
    balance: Optional[Dict[str, int]] = None
    carried_task_ids: Optional[List[str]] = None
    completed: Optional[bool] = None


class WeeklyReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    week_start: str
    step: int = 0
    reflections: Dict[str, str] = Field(default_factory=dict)
    balance: Dict[str, int] = Field(default_factory=dict)
    carried_task_ids: List[str] = Field(default_factory=list)
    completed: bool = False
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "default"
    rollover_enabled: bool = True
    default_pomodoro: int = 25
    week_start_day: str = "monday"
    default_rating_scale: int = 5
    display_name: str = "You"


class SettingsUpdate(BaseModel):
    rollover_enabled: Optional[bool] = None
    default_pomodoro: Optional[int] = None
    week_start_day: Optional[str] = None
    default_rating_scale: Optional[int] = None
    display_name: Optional[str] = None
