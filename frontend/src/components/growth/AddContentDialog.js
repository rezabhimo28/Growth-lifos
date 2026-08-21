import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const DEFAULT_UNITS = { book: "pages", film: "minutes", podcast: "minutes", course: "lessons" };

export const AddContentDialog = ({ open, onOpenChange, onSave }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("book");
  const [totalUnits, setTotalUnits] = useState("");
  const [unitLabel, setUnitLabel] = useState("pages");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(""); setType("book"); setTotalUnits(""); setUnitLabel("pages");
      setStatus("IN_PROGRESS"); setAuthor("");
    }
  }, [open]);

  const handleTypeChange = (t) => {
    setType(t);
    setUnitLabel(DEFAULT_UNITS[t]);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        type,
        status,
        total_units: Number(totalUnits) || 0,
        unit_label: unitLabel,
        metadata: author ? { author } : {},
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-content-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Growth Hub</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input data-testid="content-title-input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Atomic Habits" className="mt-1.5" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger data-testid="content-type-select" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="content-status-select" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Total ({unitLabel})</Label>
              <Input data-testid="content-total-input" type="number" min={0} value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)} placeholder="0" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unit label</Label>
              <Input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Author / Creator (optional)</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="optional" className="mt-1.5" />
          </div>
        </div>
        <DialogFooter>
          <Button data-testid="content-save-button" onClick={handleSave} disabled={!title.trim() || saving}
            className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
            {saving ? "Adding…" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
