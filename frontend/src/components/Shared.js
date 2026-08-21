import React from "react";
import { motion } from "framer-motion";

export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-heading text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {title}
        </motion.h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div
    data-testid="empty-state"
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"
  >
    {Icon && <Icon className="mb-3 h-8 w-8 text-muted-foreground/60" />}
    <p className="text-sm font-medium text-foreground/90">{title}</p>
    {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
