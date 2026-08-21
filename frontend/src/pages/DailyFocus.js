import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Timer, Plus, Trash2, Clock, Trophy, ListTodo, Zap,
  Target, Flag, X, CalendarClock, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, PageTransition } from "@/components/Shared";
import { FocusTimerDrawer } from "@/components/FocusTimerDrawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getTasks, createTask, updateTask, deleteTask, getRolloverCandidates, rolloverTasks,
  getGoals, createGoal, deleteGoal, getMilestones, createMilestone, updateMilestone, deleteMilestone,
  getSettings,
} from "@/lib/api";
import { today, addDays, formatPretty, weekStart, currentMonth, formatMonth, weekRangeLabel } from "@/lib/dateUtils";

const TIERS = [
  { key: "big_win", label: "Big Win", limit: 1, icon: Trophy, hint: "The one thing that matters most" },
  { key: "medium", label: "Medium Tasks", limit: 3, icon: ListTodo, hint: "Meaningful, moderate effort" },
  { key: "quick", label: "Quick Wins", limit: 5, icon: Zap, hint: "Small, fast to finish" },
];

/* ---------------- Task Row ---------------- */
const TaskRow = ({ task, isActive, onToggle, onDelete, onFocus, onTime }) => {
  const [start, setStart] = useState(task.start_time || "");
  const [end, setEnd] = useState(task.end_time || "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      data-testid="task-row"
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50",
        isActive && "bg-emerald-500/5 ring-1 ring-emerald-500/30"
      )}
    >
      <Checkbox
        data-testid="task-complete-checkbox"
        checked={task.completed}
        onCheckedChange={(v) => onToggle(task, !!v)}
        className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-zinc-950"
      />
      <span className={cn("flex-1 truncate text-sm", task.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground/90")}>
        {task.title}
      </span>

      {(task.start_time || task.end_time) && (
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {task.start_time || "--:--"}{task.end_time ? `–${task.end_time}` : ""}
        </span>
      )}

      {/* Timeblock popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label="Set time block" data-testid="task-timeblock-button"
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100">
            <Clock className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Time block</p>
          <div className="flex items-center gap-2">
            <Input type="time" data-testid="task-time-start-input" value={start} onChange={(e) => setStart(e.target.value)} className="h-8" />
            <span className="text-muted-foreground">–</span>
            <Input type="time" data-testid="task-time-end-input" value={end} onChange={(e) => setEnd(e.target.value)} className="h-8" />
          </div>
          <Button size="sm" className="mt-3 w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            onClick={() => onTime(task, start, end)}>Save</Button>
        </PopoverContent>
      </Popover>

      <button aria-label="Focus on task" data-testid="task-focus-button" onClick={() => onFocus(task)}
        className={cn("rounded-md p-1.5 transition-opacity hover:bg-secondary hover:text-emerald-400",
          isActive ? "text-emerald-400 opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100")}>
        <Timer className="h-4 w-4" />
      </button>
      <button aria-label="Delete task" onClick={() => onDelete(task)}
        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-red-400 group-hover:opacity-100">
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

/* ---------------- Add Goal Dialog ---------------- */
const AddGoalDialog = ({ open, onOpenChange, onSave }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  useEffect(() => { if (open) { setTitle(""); setDesc(""); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-goal-dialog" className="sm:max-w-md">
        <DialogHeader><DialogTitle>New Monthly Goal</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">Goal</Label>
            <Input data-testid="goal-title-input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 4 books" className="mt-1.5" autoFocus />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Why it matters (optional)</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="mt-1.5 resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button data-testid="goal-save-button" disabled={!title.trim()}
            onClick={() => { onSave({ title: title.trim(), description: desc }); onOpenChange(false); }}
            className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">Add goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Task Section ---------------- */
const TaskSection = ({ tier, tasks, activeTaskId, onAdd, onToggle, onDelete, onFocus, onTime }) => {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const Icon = tier.icon;
  const full = tasks.length >= tier.limit;

  const submit = () => {
    if (!value.trim()) return;
    onAdd(tier.key, value.trim());
    setValue("");
  };

  return (
    <Card className="border-border bg-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-emerald-400">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{tier.label}</p>
            <p className="text-[11px] text-muted-foreground">{tier.hint}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{tasks.length}/{tier.limit}</span>
      </div>

      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} isActive={t.id === activeTaskId}
              onToggle={onToggle} onDelete={onDelete} onFocus={onFocus} onTime={onTime} />
          ))}
        </AnimatePresence>
      </div>

      {!full && (
        adding ? (
          <div className="mt-2 flex items-center gap-2">
            <Input
              data-testid={`add-task-input-${tier.key}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setValue(""); } }}
              placeholder={`Add a ${tier.label.toLowerCase()}…`}
              className="h-9"
              autoFocus
            />
            <Button size="sm" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400" onClick={submit}>Add</Button>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => { setAdding(false); setValue(""); }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            data-testid={`add-task-button-${tier.key}`}
            onClick={() => setAdding(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        )
      )}
    </Card>
  );
};

/* ---------------- Page ---------------- */
export default function DailyFocus() {
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [settings, setSettings] = useState(null);
  const [rolloverCandidates, setRolloverCandidates] = useState([]);

  const [activeTask, setActiveTask] = useState(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [milestoneInput, setMilestoneInput] = useState("");

  const month = currentMonth();
  const ws = weekStart(date);

  const load = useCallback(async () => {
    try {
      const [t, g, m, s, rc] = await Promise.all([
        getTasks(date), getGoals(month), getMilestones(ws), getSettings(),
        getRolloverCandidates(addDays(date, -1)),
      ]);
      setTasks(t); setGoals(g); setMilestones(m); setSettings(s); setRolloverCandidates(rc);
    } catch (e) {
      toast.error("Failed to load Daily Focus");
    } finally {
      setLoading(false);
    }
  }, [date, month, ws]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  /* Tasks */
  const handleAddTask = async (tier, title) => {
    try {
      const created = await createTask({ title, tier, date });
      setTasks((prev) => [...prev, created]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not add task");
    }
  };
  const handleToggle = async (task, completed) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed } : t)));
    try { await updateTask(task.id, { completed }); } catch { toast.error("Update failed"); load(); }
  };
  const handleDeleteTask = async (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (activeTask?.id === task.id) setActiveTask(null);
    try { await deleteTask(task.id); } catch { load(); }
  };
  const handleTime = async (task, start, end) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, start_time: start, end_time: end } : t)));
    try { await updateTask(task.id, { start_time: start, end_time: end }); toast.success("Time block saved"); }
    catch { toast.error("Update failed"); }
  };
  const handleFocus = (task) => { setActiveTask(task); setTimerOpen(true); };

  /* Rollover */
  const handleRollover = async (target) => {
    try {
      const res = await rolloverTasks({
        task_ids: rolloverCandidates.map((t) => t.id),
        target,
        from_date: addDays(date, -1),
      });
      toast.success(`Moved ${res.moved} task(s) to ${target === "tomorrow" ? "today" : "backlog"}`);
      setRolloverCandidates([]);
      load();
    } catch { toast.error("Rollover failed"); }
  };

  /* Goals */
  const handleAddGoal = async (data) => {
    try {
      const created = await createGoal({ ...data, month });
      setGoals((prev) => [...prev, created]);
      toast.success("Goal added");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not add goal");
    }
  };
  const handleDeleteGoal = async (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try { await deleteGoal(id); } catch { load(); }
  };

  /* Milestones */
  const handleAddMilestone = async () => {
    if (!milestoneInput.trim()) return;
    try {
      const created = await createMilestone({ title: milestoneInput.trim(), week_start: ws });
      setMilestones((prev) => [...prev, created]);
      setMilestoneInput("");
    } catch { toast.error("Could not add milestone"); }
  };
  const handleToggleMilestone = async (m) => {
    setMilestones((prev) => prev.map((x) => (x.id === m.id ? { ...x, completed: !x.completed } : x)));
    try { await updateMilestone(m.id, { completed: !m.completed }); } catch { load(); }
  };
  const handleDeleteMilestone = async (id) => {
    setMilestones((prev) => prev.filter((x) => x.id !== id));
    try { await deleteMilestone(id); } catch { load(); }
  };

  const tasksByTier = (tier) => tasks.filter((t) => t.tier === tier).sort((a, b) => a.order - b.order);
  const isToday = date === today();

  return (
    <PageTransition>
      <PageHeader
        title="Daily Focus"
        subtitle={formatPretty(date)}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border">
              <button data-testid="date-prev-button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}
                className="px-2 py-2 text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
              <button data-testid="date-today-button" onClick={() => setDate(today())}
                className={cn("px-3 py-1.5 text-xs", isToday ? "text-emerald-400" : "text-muted-foreground hover:text-foreground")}>Today</button>
              <button data-testid="date-next-button" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}
                className="px-2 py-2 text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <Button data-testid="start-focus-button" onClick={() => setTimerOpen(true)}
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Timer className="mr-1.5 h-4 w-4" /> Start Focus
            </Button>
          </div>
        }
      />

      {/* Rollover banner */}
      <AnimatePresence>
        {settings?.rollover_enabled && rolloverCandidates.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            data-testid="rollover-suggestion-banner"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{rolloverCandidates.length} unfinished task(s) from yesterday</p>
                <p className="text-xs text-muted-foreground">Carry them forward or move them to your backlog.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button data-testid="rollover-move-tomorrow-button" size="sm" onClick={() => handleRollover("tomorrow")}
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
                <ArrowRight className="mr-1.5 h-4 w-4" /> Move to today
              </Button>
              <Button data-testid="rollover-move-backlog-button" size="sm" variant="outline" onClick={() => handleRollover("backlog")}>
                To backlog
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Tasks column */}
        <div className="space-y-4 lg:col-span-8">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </>
          ) : (
            TIERS.map((tier) => (
              <TaskSection key={tier.key} tier={tier} tasks={tasksByTier(tier.key)} activeTaskId={activeTask?.id}
                onAdd={handleAddTask} onToggle={handleToggle} onDelete={handleDeleteTask} onFocus={handleFocus} onTime={handleTime} />
            ))
          )}
        </div>

        {/* Side column */}
        <div className="mt-4 space-y-4 lg:col-span-4 lg:mt-0">
          {/* Monthly goals */}
          <Card className="border-border bg-card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <p className="text-sm font-medium">Monthly Goals</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{goals.length}/3</span>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">{formatMonth(month)}</p>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} data-testid="goal-card" className="group rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground/90">{g.title}</p>
                      {g.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>}
                    </div>
                    <button aria-label="Delete goal" onClick={() => handleDeleteGoal(g.id)}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {goals.length < 3 && (
                <button data-testid="add-goal-button" onClick={() => setGoalDialogOpen(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
                  <Plus className="h-4 w-4" /> Add goal
                </button>
              )}
              {goals.length === 0 && <p className="text-xs text-muted-foreground">Set up to 3 macro goals for the month.</p>}
            </div>
          </Card>

          {/* Weekly milestones */}
          <Card className="border-border bg-card p-4 md:p-5">
            <div className="mb-1 flex items-center gap-2">
              <Flag className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium">Weekly Milestones</p>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">Week of {weekRangeLabel(ws)}</p>
            <div className="space-y-0.5">
              {milestones.map((m) => (
                <div key={m.id} data-testid="milestone-row" className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/50">
                  <Checkbox checked={m.completed} onCheckedChange={() => handleToggleMilestone(m)}
                    className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-zinc-950" />
                  <span className={cn("flex-1 truncate text-sm", m.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground/90")}>{m.title}</span>
                  <button aria-label="Delete milestone" onClick={() => handleDeleteMilestone(m.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input data-testid="milestone-input" value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddMilestone(); }}
                placeholder="Add a milestone…" className="h-9" />
              <Button data-testid="milestone-add-button" size="sm" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400" onClick={handleAddMilestone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <FocusTimerDrawer open={timerOpen} onOpenChange={setTimerOpen} task={activeTask}
        defaultLength={settings?.default_pomodoro || 25} />
      <AddGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} onSave={handleAddGoal} />
    </PageTransition>
  );
}
