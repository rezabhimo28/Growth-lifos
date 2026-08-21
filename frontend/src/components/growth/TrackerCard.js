import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Film, Mic, GraduationCap, Plus, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const TYPE_META = {
  book: { icon: BookOpen, label: "Book" },
  film: { icon: Film, label: "Film" },
  podcast: { icon: Mic, label: "Podcast" },
  course: { icon: GraduationCap, label: "Course" },
};

const StatusBadge = ({ status }) => {
  if (status === "COMPLETED")
    return <Badge className="bg-emerald-500 text-zinc-950 hover:bg-emerald-500">Completed</Badge>;
  if (status === "IN_PROGRESS")
    return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">In Progress</Badge>;
  return <Badge variant="secondary" className="text-muted-foreground">Backlog</Badge>;
};

export const TrackerCard = ({ item, onQuickLog, onDelete, onComplete }) => {
  const meta = TYPE_META[item.type] || TYPE_META.book;
  const Icon = meta.icon;
  const pct = item.total_units > 0 ? Math.round((item.current_progress / item.total_units) * 100) : 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
      <Card data-testid="tracker-card" className="flex h-full flex-col border-border bg-card p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-400">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground/90">{item.title}</p>
              <p className="text-xs text-muted-foreground">{meta.label}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button data-testid="tracker-menu" aria-label="More" className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onComplete(item)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-400 focus:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <StatusBadge status={item.status} />
            <span className="font-mono tabular-nums text-muted-foreground">
              {item.current_progress}{item.total_units > 0 ? ` / ${item.total_units}` : ""} {item.unit_label}
            </span>
          </div>
          <Progress value={pct} className="h-2 bg-secondary" />
          <div className="mt-1 text-right text-xs font-medium tabular-nums text-emerald-400">{pct}%</div>
        </div>

        <Button
          data-testid="tracker-quick-log-button"
          onClick={() => onQuickLog(item)}
          className={cn("mt-3 w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400")}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Quick Log
        </Button>
      </Card>
    </motion.div>
  );
};
