import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Sparkles, CalendarCheck, Settings as SettingsIcon, ChevronLeft, Leaf } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/daily-focus", label: "Daily Focus", icon: LayoutDashboard, testId: "nav-daily-focus" },
  { to: "/growth-hub", label: "Growth Hub", icon: Sparkles, testId: "nav-growth-hub" },
  { to: "/weekly-review", label: "Weekly Review", icon: CalendarCheck, testId: "nav-weekly-review" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testId: "nav-settings" },
];

export const SidebarContent = ({ collapsed, onToggle, onNavigate, showToggle = true }) => {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn("flex items-center gap-2.5 px-4 h-16 border-b border-border", collapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <Leaf className="h-5 w-5 text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-heading text-sm font-semibold tracking-tight">Growth</p>
            <p className="text-[11px] text-muted-foreground">LifeOS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testId}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    collapsed && "justify-center px-2",
                    isActive &&
                      "bg-secondary text-foreground before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-emerald-500"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>
      </TooltipProvider>

      {/* Collapse toggle (desktop only) */}
      {showToggle && (
        <div className="border-t border-border p-3">
          <button
            data-testid="sidebar-toggle-button"
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );
};
