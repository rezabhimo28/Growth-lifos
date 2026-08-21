import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { SidebarContent } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-noise relative flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 border-r border-border bg-background/80 backdrop-blur transition-[width] duration-200 md:block",
          collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-expanded)]"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="mobile-menu-button"
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary/60"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[var(--sidebar-expanded)] p-0">
              <SidebarContent collapsed={false} showToggle={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-heading text-sm font-semibold">Growth LifeOS</span>
        </div>

        <main className="relative z-10 min-w-0 flex-1">
          <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}
