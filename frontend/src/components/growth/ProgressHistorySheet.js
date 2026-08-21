import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sparkles, TrendingUp } from "lucide-react";
import { getProgressLogs } from "@/lib/api";
import { formatShort } from "@/lib/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_META } from "@/components/growth/TrackerCard";

export const ProgressHistorySheet = ({ open, onOpenChange, item }) => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (open && item) {
      setLoading(true);
      getProgressLogs({ content_id: item.id })
        .then((data) => setLogs(data))
        .catch(() => setLogs([]))
        .finally(() => setLoading(false));
    }
  }, [open, item]);

  if (!item) return null;
  const Icon = (TYPE_META[item.type] || TYPE_META.book).icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="progress-history-sheet" side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">{item.title}</SheetTitle>
              <SheetDescription className="text-left">Your Active Recall timeline</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
              <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No progress logged yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Use Quick Log to start building your recall timeline.</p>
            </div>
          ) : (
            <div className="relative space-y-0 pl-6">
              <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
              {logs.map((log) => (
                <div key={log.id} data-testid="history-log-row" className="relative pb-5">
                  <div className="absolute -left-[18px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-emerald-400">+{log.increment} {log.unit_label}</span>
                    <span className="text-xs text-muted-foreground">{formatShort(log.date)}</span>
                  </div>
                  {log.note ? (
                    <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-secondary/50 px-3 py-2">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <p className="text-sm text-foreground/90">{log.note}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs italic text-muted-foreground/70">No recall note</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
