import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const KpiCard = ({ icon: Icon, label, value, sub, accent = false, testId }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
    <Card
      data-testid={testId}
      className="border-border bg-card p-4 md:p-5 shadow-[0_1px_0_hsl(0_0%_100%/0.04),0_10px_30px_hsl(0_0%_0%/0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-heading text-2xl font-semibold tabular-nums md:text-3xl">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-secondary text-muted-foreground"
          )}
        >
          {Icon && <Icon className="h-4.5 w-4.5" />}
        </div>
      </div>
    </Card>
  </motion.div>
);
