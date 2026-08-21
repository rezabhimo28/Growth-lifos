import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Timer, Star, User, Save } from "lucide-react";
import { PageHeader, PageTransition } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getSettings, updateSettings } from "@/lib/api";

const Row = ({ icon: Icon, title, desc, children }) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState(null);

  useEffect(() => {
    getSettings().then((data) => { setS(data); setLoading(false); }).catch(() => { toast.error("Failed to load settings"); setLoading(false); });
  }, []);

  const update = (patch) => setS((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        rollover_enabled: s.rollover_enabled,
        default_pomodoro: Number(s.default_pomodoro),
        week_start_day: s.week_start_day,
        default_rating_scale: Number(s.default_rating_scale),
        display_name: s.display_name,
      });
      toast.success("Settings saved");
    } catch { toast.error("Could not save settings"); }
    finally { setSaving(false); }
  };

  return (
    <PageTransition>
      <div data-testid="settings-page">
        <PageHeader title="Settings" subtitle="Tune your LifeOS to fit your rhythm." />
        {loading || !s ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <div className="space-y-6">
            <Card className="border-border bg-card px-5">
              <div className="divide-y divide-border">
                <Row icon={User} title="Display name" desc="Shown across your workspace.">
                  <Input data-testid="settings-display-name" value={s.display_name || ""}
                    onChange={(e) => update({ display_name: e.target.value })} className="w-44" />
                </Row>
                <Row icon={CalendarClock} title="Auto-rollover" desc="Suggest carrying unfinished tasks forward.">
                  <Switch data-testid="settings-rollover-switch" checked={s.rollover_enabled}
                    onCheckedChange={(v) => update({ rollover_enabled: v })} />
                </Row>
                <Row icon={Timer} title="Default focus length" desc="Starting length for the focus timer.">
                  <Select value={String(s.default_pomodoro)} onValueChange={(v) => update({ default_pomodoro: v })}>
                    <SelectTrigger data-testid="settings-pomodoro-select" className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="25">25 min</SelectItem>
                      <SelectItem value="50">50 min</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
                <Row icon={CalendarClock} title="Week starts on" desc="Used for weekly milestones & review.">
                  <Select value={s.week_start_day} onValueChange={(v) => update({ week_start_day: v })}>
                    <SelectTrigger data-testid="settings-weekstart-select" className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
                <Row icon={Star} title="Rating scale" desc="Max stars for rating content.">
                  <Select value={String(s.default_rating_scale)} onValueChange={(v) => update({ default_rating_scale: v })}>
                    <SelectTrigger data-testid="settings-rating-select" className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 stars</SelectItem>
                      <SelectItem value="10">10 points</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button data-testid="settings-save-button" onClick={save} disabled={saving}
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
                <Save className="mr-1.5 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
