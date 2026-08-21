import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from "recharts";
import {
  ArrowLeft, ArrowRight, Check, BarChart3, MessageSquareText, Scale, CalendarPlus, CheckCircle2, Sparkles,
} from "lucide-react";
import { PageHeader, PageTransition, EmptyState } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/growth/KpiCard";
import { cn } from "@/lib/utils";
import {
  getReviewSummary, getWeeklyReview, saveWeeklyReview, getPendingTasks, updateTask,
} from "@/lib/api";
import { weekStart, today, addDays, weekRangeLabel, formatMinutes } from "@/lib/dateUtils";

const STEPS = [
  { id: 0, name: "Summary", icon: BarChart3 },
  { id: 1, name: "Reflection", icon: MessageSquareText },
  { id: 2, name: "Balance", icon: Scale },
  { id: 3, name: "Next Week", icon: CalendarPlus },
];

const QUESTIONS = [
  { key: "wins", label: "What went well this week?", placeholder: "Celebrate the wins, big or small…" },
  { key: "challenges", label: "What held you back?", placeholder: "Obstacles, distractions, blockers…" },
  { key: "focus", label: "What is your #1 focus next week?", placeholder: "One clear intention…" },
];

const BALANCE = [
  { key: "work", label: "Work intensity", low: "Too light", high: "Overloaded" },
  { key: "energy", label: "Energy level", low: "Depleted", high: "Energized" },
  { key: "balance", label: "Work–life balance", low: "Off balance", high: "Well balanced" },
];

export default function WeeklyReview() {
  const ws = weekStart(today());
  const nextWeek = addDays(ws, 7);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [reflections, setReflections] = useState({});
  const [balance, setBalance] = useState({ work: 3, energy: 3, balance: 3 });
  const [pending, setPending] = useState([]);
  const [carried, setCarried] = useState({});
  const [finished, setFinished] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, r, p] = await Promise.all([getReviewSummary(ws), getWeeklyReview(ws), getPendingTasks(ws)]);
      setSummary(s);
      setReflections(r.reflections || {});
      if (r.balance && Object.keys(r.balance).length) setBalance({ work: 3, energy: 3, balance: 3, ...r.balance });
      setPending(p);
      setStep(r.completed ? 0 : r.step || 0);
      setFinished(!!r.completed);
    } catch (e) {
      toast.error("Failed to load Weekly Review");
    } finally {
      setLoading(false);
    }
  }, [ws]);

  useEffect(() => { load(); }, [load]);

  const persist = async (extra = {}) => {
    try {
      await saveWeeklyReview({ week_start: ws, step, reflections, balance, ...extra });
    } catch { /* silent */ }
  };

  const goNext = async () => {
    const ns = Math.min(step + 1, STEPS.length - 1);
    setStep(ns);
    await persist({ step: ns });
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    const carriedIds = Object.keys(carried).filter((k) => carried[k]);
    try {
      await Promise.all(carriedIds.map((id) => updateTask(id, { date: nextWeek })));
      await saveWeeklyReview({ week_start: ws, step: 3, reflections, balance, carried_task_ids: carriedIds, completed: true });
      setFinished(true);
      toast.success(`Weekly review complete · ${carriedIds.length} task(s) carried to next week`);
    } catch { toast.error("Could not finish review"); }
  };

  const chartData = summary?.per_day || [];

  if (loading) {
    return (
      <PageTransition>
        <PageHeader title="Weekly Review" subtitle={`Week of ${weekRangeLabel(ws)}`} />
        <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        <Skeleton className="mt-6 h-80 rounded-xl" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="Weekly Review"
        subtitle={`Week of ${weekRangeLabel(ws)}`}
        actions={finished && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        )}
      />

      {/* Stepper header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const activeStep = i === step;
            return (
              <React.Fragment key={s.id}>
                <button data-testid={`wizard-step-${s.id}`} onClick={() => i <= step && setStep(i)}
                  className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                    activeStep ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                      : done ? "border-emerald-500/50 bg-emerald-500 text-zinc-950"
                        : "border-border bg-secondary text-muted-foreground"
                  )}>
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn("hidden text-xs sm:block", activeStep ? "text-foreground" : "text-muted-foreground")}>{s.name}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="mx-2 h-px flex-1 bg-border">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: i < step ? "100%" : "0%" }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}>
          {/* STEP 0 — Summary */}
          {step === 0 && (
            <div data-testid="weekly-review-step-summary" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <KpiCard icon={CheckCircle2} label="Tasks Done" value={`${summary?.completed_tasks ?? 0}`}
                  sub={`of ${summary?.total_tasks ?? 0} planned`} accent />
                <KpiCard icon={MessageSquareText} label="Study / Watch" value={formatMinutes(summary?.study_minutes)} sub="podcasts & film" />
                <KpiCard icon={BarChart3} label="Reading" value={`${summary?.reading_units ?? 0}`} sub="pages logged" />
                <KpiCard icon={Scale} label="Exercise" value={formatMinutes(summary?.exercise_minutes)} sub="this week" />
              </div>
              <Card className="border-border bg-card p-4 md:p-5">
                <p className="mb-4 text-sm font-medium">Output vs Input — daily breakdown</p>
                {chartData.every((d) => !d.completed && !d.study && !d.exercise) ? (
                  <EmptyState icon={BarChart3} title="No data yet this week" description="Complete tasks and log progress to see your weekly rhythm." />
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="hsl(240 6% 16%)" strokeOpacity={0.6} vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "hsl(240 5% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(240 5% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RTooltip contentStyle={{ background: "hsl(240 8% 8%)", border: "1px solid hsl(240 6% 16%)", borderRadius: 12, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="completed" name="Tasks done" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                        <Line dataKey="study" name="Study (min)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                        <Line dataKey="exercise" name="Exercise (min)" stroke="rgba(250,250,250,0.45)" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* STEP 1 — Reflection */}
          {step === 1 && (
            <div data-testid="weekly-review-step-reflection" className="space-y-5">
              {QUESTIONS.map((q) => (
                <Card key={q.key} className="border-border bg-card p-4 md:p-5">
                  <Label className="text-sm font-medium">{q.label}</Label>
                  <Textarea
                    data-testid={`reflection-${q.key}`}
                    value={reflections[q.key] || ""}
                    onChange={(e) => setReflections((r) => ({ ...r, [q.key]: e.target.value }))}
                    onBlur={() => persist()}
                    placeholder={q.placeholder}
                    className="mt-2 max-w-[65ch] resize-none"
                    rows={3}
                  />
                </Card>
              ))}
            </div>
          )}

          {/* STEP 2 — Balance */}
          {step === 2 && (
            <div data-testid="weekly-review-step-balance" className="space-y-4">
              <Card className="border-border bg-card p-5 md:p-6">
                <div className="space-y-8">
                  {BALANCE.map((b) => (
                    <div key={b.key}>
                      <div className="mb-3 flex items-center justify-between">
                        <Label className="text-sm font-medium">{b.label}</Label>
                        <span className="font-mono text-lg font-semibold tabular-nums text-emerald-400">{balance[b.key]}/5</span>
                      </div>
                      <Slider
                        data-testid={`balance-${b.key}`}
                        value={[balance[b.key]]}
                        min={1} max={5} step={1}
                        onValueChange={(v) => setBalance((prev) => ({ ...prev, [b.key]: v[0] }))}
                        onValueCommit={() => persist()}
                      />
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>{b.low}</span><span>{b.high}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* STEP 3 — Next Week Planner */}
          {step === 3 && (
            <div data-testid="weekly-review-step-next-week" className="space-y-4">
              <Card className="border-border bg-card p-4 md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-medium">Carry unfinished work into next week</p>
                </div>
                {pending.length === 0 ? (
                  <EmptyState icon={CheckCircle2} title="All clear!" description="No unfinished tasks to carry forward. Great work this week." />
                ) : (
                  <div className="space-y-1">
                    {pending.map((t) => (
                      <label key={t.id} data-testid="pending-task-row"
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/50">
                        <Checkbox
                          checked={!!carried[t.id]}
                          onCheckedChange={(v) => setCarried((c) => ({ ...c, [t.id]: !!v }))}
                          className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-zinc-950"
                        />
                        <span className="flex-1 truncate text-sm text-foreground/90">{t.title}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {t.date === "backlog" ? "backlog" : t.tier.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <Button data-testid="weekly-review-back-button" variant="outline" onClick={goBack} disabled={step === 0}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button data-testid="weekly-review-next-button" onClick={goNext} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
            Next <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button data-testid="weekly-review-finish-button" onClick={finish} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
            <Check className="mr-1.5 h-4 w-4" /> Finish Review
          </Button>
        )}
      </div>
    </PageTransition>
  );
}
