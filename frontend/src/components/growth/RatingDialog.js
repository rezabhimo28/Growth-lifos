import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/growth/StarRating";
import { PartyPopper } from "lucide-react";

export const RatingDialog = ({ open, onOpenChange, item, onSave }) => {
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRating(item?.rating || 0);
  }, [open, item]);

  if (!item) return null;

  const handleSave = async (skip = false) => {
    setSaving(true);
    try {
      await onSave(item, skip ? null : rating);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="rating-dialog" className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <PartyPopper className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-left text-base">Completed!</DialogTitle>
              <DialogDescription className="text-left">How would you rate “{item.title}”?</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-6">
          <StarRating testId="rating-stars" value={rating} onChange={setRating} size={34} />
          <span className="text-xs text-muted-foreground">{rating > 0 ? `${rating} / 5` : "Tap a star to rate"}</span>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => handleSave(true)} disabled={saving}>Skip</Button>
          <Button data-testid="rating-save-button" className="flex-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            onClick={() => handleSave(false)} disabled={saving || rating === 0}>
            {saving ? "Saving…" : "Save rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
