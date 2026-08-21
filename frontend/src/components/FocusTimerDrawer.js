import React, { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SESSIONS = [15, 25, 50];

export const FocusTimerDrawer = ({ open, onOpenChange, task, defaultLength = 25 }) => {
  const [length, setLength] = useState(defaultLength);
  const [secondsLeft, setSecondsLeft] = useState(defaultLength * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  // Reset when opening or when length changes while not running
  useEffect(() => {
    if (open) {
      setRunning(false);
      setLength(defaultLength);
      setSecondsLeft(defaultLength * 60);
    }
  }, [open, defaultLength]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            toast.success("Focus session complete! Take a short break.");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const total = length * 60;
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;
  const deg = (pct / 100) * 360;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const selectLength = (m) => {
    setLength(m);
    setSecondsLeft(m * 60);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(length * 60);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="focus-timer-drawer" side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <TimerIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">Focus Session</SheetTitle>
              <SheetDescription className="text-left">
                {task ? task.title : "Pick a task to focus on"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col items-center py-8">
          {/* Session length chips */}
          <div className="mb-8 flex gap-2">
            {SESSIONS.map((m) => (
              <button
                key={m}
                data-testid="focus-session-length-chip"
                onClick={() => selectLength(m)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  length === m
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                    : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Circular ring */}
          <div
            className="timer-ring relative flex h-56 w-56 items-center justify-center rounded-full"
            style={{ "--ring-deg": `${deg}deg` }}
          >
            <div className="flex h-[13rem] w-[13rem] flex-col items-center justify-center rounded-full bg-card">
              <span className="font-mono text-5xl font-semibold tabular-nums tracking-tight">
                {mm}:{ss}
              </span>
              <span className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                {running ? "Focusing" : secondsLeft === 0 ? "Done" : "Ready"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={reset} aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            {running ? (
              <Button data-testid="focus-pause-button" onClick={() => setRunning(false)}
                className="h-12 w-32 bg-secondary text-foreground hover:bg-secondary/80">
                <Pause className="mr-1.5 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button data-testid="focus-start-button" onClick={() => secondsLeft > 0 && setRunning(true)}
                className="h-12 w-32 bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
                <Play className="mr-1.5 h-4 w-4" /> Start
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
