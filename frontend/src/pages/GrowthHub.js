import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Flame, BookOpen, Dumbbell, Target, Plus, Trash2, Activity } from "lucide-react";
import { PageHeader, PageTransition, EmptyState } from "@/components/Shared";
import { KpiCard } from "@/components/growth/KpiCard";
import { TrackerCard, TYPE_META } from "@/components/growth/TrackerCard";
import { QuickLogSheet } from "@/components/growth/QuickLogSheet";
import { AddContentDialog } from "@/components/growth/AddContentDialog";
import { FitnessDialog } from "@/components/growth/FitnessDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getContent, createContent, updateContent, deleteContent, logProgress,
  getFitness, createFitness, deleteFitness, getGrowthDashboard,
} from "@/lib/api";
import { weekStart, today, formatMinutes, formatShort } from "@/lib/dateUtils";

export default function GrowthHub() {
  const ws = weekStart(today());
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [fitness, setFitness] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [quickLogItem, setQuickLogItem] = useState(null);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [fitnessOpen, setFitnessOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, f, d] = await Promise.all([getContent(), getFitness(), getGrowthDashboard(ws)]);
      setContent(c);
      setFitness(f);
      setDashboard(d);
    } catch (e) {
      toast.error("Failed to load Growth Hub");
    } finally {
      setLoading(false);
    }
  }, [ws]);

  useEffect(() => { load(); }, [load]);

  const active = content.filter((c) => c.status !== "BACKLOG");
  const backlog = content.filter((c) => c.status === "BACKLOG");

  const handleQuickLog = (item) => { setQuickLogItem(item); setQuickLogOpen(true); };

  const handleSaveLog = async (payload) => {
    await logProgress(payload.content_id, payload);
    toast.success("Progress logged");
    await load();
  };

  const handleAddContent = async (data) => {
    await createContent(data);
    toast.success("Added to Growth Hub");
    await load();
  };

  const handleComplete = async (item) => {
    await updateContent(item.id, { status: "COMPLETED" });
    toast.success(`Marked "${item.title}" completed`);
    await load();
  };

  const handleDelete = async (item) => {
    await deleteContent(item.id);
    toast.success("Deleted");
    await load();
  };

  const handleActivate = async (item) => {
    await updateContent(item.id, { status: "IN_PROGRESS" });
    toast.success("Moved to active trackers");
    await load();
  };

  const handleAddFitness = async (data) => {
    await createFitness(data);
    toast.success("Workout logged");
    await load();
  };

  const handleDeleteFitness = async (id) => {
    await deleteFitness(id);
    await load();
  };

  return (
    <PageTransition>
      <PageHeader
        title="Growth Hub"
        subtitle="Track what you read, watch, learn and train."
        actions={
          <>
            <Button data-testid="log-workout-button" variant="outline" onClick={() => setFitnessOpen(true)}>
              <Dumbbell className="mr-1.5 h-4 w-4" /> Log Workout
            </Button>
            <Button data-testid="add-content-button" onClick={() => setAddOpen(true)}
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus className="mr-1.5 h-4 w-4" /> Add Item
            </Button>
          </>
        }
      />

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <KpiCard testId="kpi-streak" icon={Flame} label="Streak" value={`${dashboard?.streak ?? 0}d`}
            sub="consecutive active days" accent />
          <KpiCard testId="kpi-study" icon={BookOpen} label="Study Time" value={formatMinutes(dashboard?.study_minutes)}
            sub="this week" />
          <KpiCard testId="kpi-exercise" icon={Dumbbell} label="Exercise" value={formatMinutes(dashboard?.exercise_minutes)}
            sub="this week" />
          <KpiCard testId="kpi-completion" icon={Target} label="Task Completion" value={`${dashboard?.completion_rate ?? 0}%`}
            sub={`${dashboard?.completed_tasks ?? 0}/${dashboard?.total_tasks ?? 0} tasks`} />
        </div>
      )}

      {/* Active Trackers */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium tracking-wide text-foreground/90">Active Trackers</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No active trackers yet"
            description="Add a book, film, podcast or course to start tracking progress."
            action={<Button onClick={() => setAddOpen(true)} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus className="mr-1.5 h-4 w-4" /> Add your first item</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {active.map((item) => (
              <TrackerCard key={item.id} item={item} onQuickLog={handleQuickLog}
                onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      {/* Fitness log */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wide text-foreground/90">Recent Workouts</h2>
        </div>
        {!loading && fitness.length === 0 ? (
          <EmptyState icon={Activity} title="No workouts logged"
            description="Log runs, lifts or any activity to build your exercise streak."
            action={<Button variant="outline" onClick={() => setFitnessOpen(true)}>
              <Dumbbell className="mr-1.5 h-4 w-4" /> Log a workout</Button>} />
        ) : (
          <Card className="divide-y divide-border border-border bg-card">
            {fitness.slice(0, 6).map((f) => (
              <div key={f.id} data-testid="fitness-row" className="group flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-400">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground/90">{f.activity}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatShort(f.date)} · {f.duration_min}m
                      {f.metrics?.sets ? ` · ${f.metrics.sets}×${f.metrics.reps || "?"}` : ""}
                      {f.metrics?.distance_km ? ` · ${f.metrics.distance_km}km` : ""}
                    </p>
                  </div>
                </div>
                <button aria-label="Delete workout" onClick={() => handleDeleteFitness(f.id)}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-red-400 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>

      {/* Backlog Accordion */}
      <section className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem data-testid="backlog-accordion" value="backlog" className="rounded-xl border border-border bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                Backlog
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{backlog.length}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {backlog.length === 0 ? (
                <p className="pb-3 text-sm text-muted-foreground">Nothing saved for later. Add items with the “Backlog” status to see them here.</p>
              ) : (
                <div className="space-y-1 pb-2">
                  {backlog.map((item) => {
                    const Icon = (TYPE_META[item.type] || TYPE_META.book).icon;
                    return (
                      <div key={item.id} data-testid="backlog-item-row"
                        className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-secondary/50">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm text-foreground/90">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleActivate(item)}>Start</Button>
                          <button aria-label="Delete" onClick={() => handleDelete(item)}
                            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <QuickLogSheet open={quickLogOpen} onOpenChange={setQuickLogOpen} item={quickLogItem} onSave={handleSaveLog} />
      <AddContentDialog open={addOpen} onOpenChange={setAddOpen} onSave={handleAddContent} />
      <FitnessDialog open={fitnessOpen} onOpenChange={setFitnessOpen} onSave={handleAddFitness} />
    </PageTransition>
  );
}
