import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { today } from "@/lib/dateUtils";

export const FitnessDialog = ({ open, onOpenChange, onSave }) => {
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [distance, setDistance] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setActivity(""); setDuration(""); setSets(""); setReps(""); setDistance(""); setNote(""); setDate(today());
    }
  }, [open]);

  const handleSave = async () => {
    if (!activity.trim() || !duration) return;
    const metrics = {};
    if (sets) metrics.sets = Number(sets);
    if (reps) metrics.reps = Number(reps);
    if (distance) metrics.distance_km = Number(distance);
    setSaving(true);
    try {
      await onSave({ activity: activity.trim(), duration_min: Number(duration), metrics, note, date });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="fitness-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a workout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">Activity</Label>
            <Input data-testid="fitness-activity-input" value={activity} onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Running, Strength" className="mt-1.5" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Duration (min)</Label>
              <Input data-testid="fitness-duration-input" type="number" min={0} value={duration}
                onChange={(e) => setDuration(e.target.value)} placeholder="30" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Sets</Label>
              <Input type="number" min={0} value={sets} onChange={(e) => setSets(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reps</Label>
              <Input type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dist (km)</Label>
              <Input type="number" min={0} step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it feel?" className="mt-1.5" />
          </div>
        </div>
        <DialogFooter>
          <Button data-testid="fitness-save-button" onClick={handleSave} disabled={!activity.trim() || !duration || saving}
            className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
            {saving ? "Saving…" : "Log workout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
