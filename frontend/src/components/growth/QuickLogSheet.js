import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Sparkles } from "lucide-react";
import { today } from "@/lib/dateUtils";
import { TYPE_META } from "@/components/growth/TrackerCard";

const QUICK_CHIPS = {
  book: [5, 10, 25, 50],
  film: [15, 30, 60, 90],
  podcast: [15, 30, 45, 60],
  course: [1, 2, 3, 5],
};

export const QuickLogSheet = ({ open, onOpenChange, item, onSave }) => {
  const [increment, setIncrement] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setIncrement(0);
      setNote("");
      setDate(today());
    }
  }, [open, item]);

  if (!item) return null;
  const meta = TYPE_META[item.type] || TYPE_META.book;
  const Icon = meta.icon;
  const chips = QUICK_CHIPS[item.type] || [5, 10, 25, 50];

  const handleSave = async () => {
    if (increment <= 0) return;
    setSaving(true);
    try {
      await onSave({ content_id: item.id, increment: Number(increment), note, date });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="quick-log-sheet" side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">{item.title}</SheetTitle>
              <SheetDescription className="text-left">Log your progress in seconds.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <div>
            <Label className="text-xs text-muted-foreground">Add progress ({item.unit_label})</Label>
            <div className="mt-2 flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="shrink-0"
                onClick={() => setIncrement((v) => Math.max(0, Number(v) - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                data-testid="quick-log-increment-input"
                type="number"
                min={0}
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
                className="text-center font-mono text-lg tabular-nums"
              />
              <Button type="button" variant="outline" size="icon" className="shrink-0"
                onClick={() => setIncrement((v) => Number(v) + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setIncrement((v) => Number(v) + c)}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-foreground"
                >
                  +{c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Active Recall Hook
            </Label>
            <Textarea
              data-testid="quick-log-active-recall-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One sentence to remember what mattered…"
              className="mt-2 resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              data-testid="quick-log-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            data-testid="quick-log-save-button"
            onClick={handleSave}
            disabled={increment <= 0 || saving}
            className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
          >
            {saving ? "Saving…" : "Save progress"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
