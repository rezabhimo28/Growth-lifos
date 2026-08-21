{
  "product": {
    "name": "Personal Growth & LifeOS",
    "app_type": "dashboard / productivity SaaS (single-user)",
    "brand_attributes": [
      "distraction-free",
      "premium-minimal",
      "quietly-motivating",
      "high-clarity",
      "data-honest (no gamified noise)"
    ],
    "north_star_actions": [
      "Capture today’s 1-3-5 tasks quickly",
      "Start focus session for the active task (visual timer drawer)",
      "Log progress to a growth item in <10 seconds",
      "Complete weekly review wizard and generate next week plan"
    ]
  },

  "inspiration_refs": {
    "design_patterns": [
      {
        "title": "Dashboard layout patterns (sidebar widths, KPI cards, grid density)",
        "url": "https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/",
        "notes": "Use 256px expanded sidebar, 64px collapsed icon rail; KPI cards above fold; grid-based content."
      },
      {
        "title": "shadcn blocks: dashboard layout reference",
        "url": "https://www.shadcnblocks.com/block/dashboard8",
        "notes": "Good reference for card density, header + content rhythm, chart placement."
      }
    ],
    "wizard_drawer_patterns": [
      {
        "title": "shadcn blocks: stepper drawer wizard",
        "url": "https://www.shadcn.io/blocks/stepper-drawer-wizard",
        "notes": "Use as the Weekly Review chrome: step header, progress indicator, footer nav."
      },
      {
        "title": "shadcn examples: simple bottom drawer",
        "url": "https://www.shadcn.io/examples/simple-bottom-drawer",
        "notes": "Use for Quick Log bottom sheet on mobile; swipe-to-dismiss."
      },
      {
        "title": "shadcn drawer docs",
        "url": "https://ui.shadcn.com/docs/components/base/drawer",
        "notes": "Follow current Drawer API; ensure focus trap + accessibility."
      }
    ]
  },

  "design_tokens": {
    "notes": "Honor user palette: dark zinc/slate background (#09090b) + emerald accent (#10b981). Keep gradients minimal and only as subtle ambient background washes (<20% viewport).",

    "css_custom_properties": {
      "where": "/app/frontend/src/index.css (replace :root and .dark tokens; app is dark-first so set .dark on <html> by default)",
      "tokens": {
        "--background": "240 10% 3%",
        "--foreground": "0 0% 98%",

        "--card": "240 8% 6%",
        "--card-foreground": "0 0% 98%",

        "--popover": "240 8% 6%",
        "--popover-foreground": "0 0% 98%",

        "--primary": "158 64% 40%",
        "--primary-foreground": "0 0% 6%",

        "--secondary": "240 6% 12%",
        "--secondary-foreground": "0 0% 98%",

        "--muted": "240 6% 12%",
        "--muted-foreground": "240 5% 65%",

        "--accent": "240 6% 12%",
        "--accent-foreground": "0 0% 98%",

        "--border": "240 6% 16%",
        "--input": "240 6% 16%",
        "--ring": "158 64% 40%",

        "--destructive": "0 72% 45%",
        "--destructive-foreground": "0 0% 98%",

        "--radius": "0.75rem",

        "--chart-1": "158 64% 40%",
        "--chart-2": "190 70% 45%",
        "--chart-3": "45 90% 55%",
        "--chart-4": "280 55% 60%",
        "--chart-5": "0 0% 75%",

        "--shadow-elev-1": "0 1px 0 hsl(0 0% 100% / 0.04), 0 10px 30px hsl(0 0% 0% / 0.35)",
        "--shadow-elev-2": "0 1px 0 hsl(0 0% 100% / 0.06), 0 18px 50px hsl(0 0% 0% / 0.45)",

        "--focus-ring": "0 0 0 3px hsl(158 64% 40% / 0.25)",

        "--sidebar-expanded": "16rem",
        "--sidebar-collapsed": "4rem",

        "--space-1": "0.25rem",
        "--space-2": "0.5rem",
        "--space-3": "0.75rem",
        "--space-4": "1rem",
        "--space-5": "1.25rem",
        "--space-6": "1.5rem",
        "--space-8": "2rem",
        "--space-10": "2.5rem",
        "--space-12": "3rem"
      },
      "ambient_background": {
        "rule": "Allowed: subtle radial wash behind header only; must not exceed 20% viewport; never behind text-heavy areas.",
        "tailwind_example": "bg-[radial-gradient(60%_60%_at_20%_0%,hsl(158_64%_40%/0.12)_0%,transparent_60%)]"
      },
      "noise_overlay": {
        "rule": "Use a subtle CSS noise overlay on the app shell only (not inside cards).",
        "css_snippet": ".app-noise::before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.06;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>');mix-blend-mode:overlay;}",
        "usage": "Add className=\"app-noise\" to the top-level layout wrapper."
      }
    },

    "palette": {
      "background": "#09090b",
      "surface_1": "#0d0d10",
      "surface_2": "#111116",
      "border": "#23232b",
      "text_primary": "#fafafa",
      "text_secondary": "#a1a1aa",
      "text_tertiary": "#71717a",
      "accent_emerald": "#10b981",
      "accent_emerald_soft": "rgba(16,185,129,0.14)",
      "danger": "#ef4444",
      "warning": "#f59e0b",
      "info": "#38bdf8"
    },

    "semantic_color_system": {
      "success": "emerald (progress, completion, positive deltas)",
      "focus": "emerald ring + subtle glow",
      "neutral": "zinc/slate surfaces",
      "danger": "red only for destructive actions",
      "warning": "amber only for overdue/at-risk",
      "info": "sky only for informational hints"
    }
  },

  "typography": {
    "font_pairing": {
      "heading": {
        "family": "Space Grotesk",
        "why": "Minimal, slightly technical, premium in dark UI; strong numerals for metrics."
      },
      "body": {
        "family": "Inter",
        "why": "High legibility for dense dashboards and forms."
      },
      "mono_optional": {
        "family": "IBM Plex Mono",
        "usage": "Time values, timer, small metadata chips."
      },
      "google_fonts_import": "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');"
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "section_title": "text-sm font-medium tracking-wide text-foreground/90",
      "body": "text-sm md:text-base text-foreground/90",
      "caption": "text-xs text-muted-foreground",
      "metric_number": "text-2xl md:text-3xl font-semibold tabular-nums",
      "metric_delta": "text-xs font-medium tabular-nums"
    },
    "line_length": {
      "rule": "Keep reading blocks (reflection answers) at max-w-[65ch]."
    }
  },

  "layout_grid": {
    "app_shell": {
      "structure": "Sidebar (collapsible) + Top header (page title + quick actions) + Scrollable content",
      "desktop": {
        "sidebar_expanded": "w-[var(--sidebar-expanded)]",
        "sidebar_collapsed": "w-[var(--sidebar-collapsed)]",
        "content_max_width": "max-w-[1200px] (center within content area only; do not center entire app)",
        "content_padding": "px-4 md:px-6 lg:px-8 py-6"
      },
      "mobile": {
        "pattern": "Sidebar becomes Sheet (left slide-over). Bottom Quick Actions uses Drawer.",
        "content_padding": "px-4 py-5"
      }
    },
    "cards_and_sections": {
      "kpi_row": "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4",
      "main_two_column": "lg:grid lg:grid-cols-12 lg:gap-6",
      "primary_column": "lg:col-span-8",
      "secondary_column": "lg:col-span-4",
      "tracker_grid": "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4"
    },
    "spacing_rules": {
      "rule": "Use 2–3x more spacing than feels comfortable; prefer whitespace over borders.",
      "section_gap": "space-y-6 md:space-y-8",
      "card_padding": "p-4 md:p-5",
      "dense_list_row": "py-2.5"
    }
  },

  "components": {
    "component_path": {
      "shadcn_ui": "/app/frontend/src/components/ui",
      "primary_components": [
        "button.jsx",
        "card.jsx",
        "sheet.jsx",
        "drawer.jsx",
        "tabs.jsx",
        "accordion.jsx",
        "collapsible.jsx",
        "progress.jsx",
        "table.jsx",
        "select.jsx",
        "textarea.jsx",
        "input.jsx",
        "calendar.jsx",
        "tooltip.jsx",
        "dropdown-menu.jsx",
        "separator.jsx",
        "skeleton.jsx",
        "sonner.jsx"
      ]
    },

    "sidebar_navigation": {
      "behavior": [
        "Expanded width 16rem; collapsed width 4rem icon rail",
        "Collapsed state shows tooltips on hover/focus",
        "Active route: subtle emerald-tinted background + left indicator",
        "Keyboard: arrow/tab navigable; focus ring visible"
      ],
      "tailwind_spec": {
        "shell": "h-dvh bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur border-r border-border",
        "nav_item": "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "nav_item_active": "bg-secondary text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-emerald-500/90",
        "icon": "h-4 w-4",
        "collapsed": "justify-center px-2",
        "tooltip": "Use <Tooltip> for collapsed labels"
      },
      "data_testids": {
        "sidebar_toggle": "sidebar-toggle-button",
        "nav_daily_focus": "nav-daily-focus",
        "nav_growth_hub": "nav-growth-hub",
        "nav_weekly_review": "nav-weekly-review",
        "nav_settings": "nav-settings"
      }
    },

    "top_header": {
      "pattern": "Sticky header inside content scroll container (not global fixed) with page title, date context, and Quick Actions.",
      "tailwind_spec": {
        "wrapper": "sticky top-0 z-20 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/70 backdrop-blur border-b border-border",
        "title": "font-[family:var(--font-heading)] text-xl md:text-2xl font-semibold tracking-tight",
        "subtitle": "text-xs md:text-sm text-muted-foreground",
        "actions": "flex items-center gap-2"
      },
      "quick_actions": [
        {
          "label": "Quick Log",
          "component": "Sheet or Drawer (mobile)",
          "icon": "Plus",
          "data-testid": "quick-log-open-button"
        },
        {
          "label": "Start Focus",
          "component": "Drawer (right side on desktop; bottom on mobile)",
          "icon": "Timer",
          "data-testid": "focus-drawer-open-button"
        }
      ]
    },

    "buttons": {
      "style": "Professional / Minimal with soft radius (10–12px) and subtle elevation",
      "variants": {
        "primary": {
          "usage": "Main CTAs: Start Focus, Save, Complete Step",
          "tailwind": "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/40",
          "motion": "hover: translateY(-1px) + subtle glow; active: scale(0.98)"
        },
        "secondary": {
          "usage": "Neutral actions: Add Task, Add Item",
          "tailwind": "bg-secondary text-foreground hover:bg-secondary/80 border border-border",
          "motion": "hover: slight brighten"
        },
        "ghost": {
          "usage": "Icon buttons in header, overflow menus",
          "tailwind": "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
        },
        "destructive": {
          "usage": "Delete task/log",
          "tailwind": "bg-red-500 text-white hover:bg-red-400"
        }
      },
      "data_testids": {
        "primary_cta": "primary-cta-button",
        "secondary_cta": "secondary-cta-button"
      }
    },

    "cards_metrics": {
      "kpi_card": {
        "component": "Card",
        "visual": "Slightly lifted surface with hairline border; metric number uses tabular-nums",
        "tailwind": "bg-card border border-border rounded-xl shadow-[var(--shadow-elev-1)]",
        "inner": "p-4 md:p-5",
        "micro": "On hover: border brightens + tiny lift (translateY(-1px))",
        "kpi_layout": "flex items-start justify-between gap-3",
        "sparkline": "Use Recharts mini line chart with stroke emerald-500/80 and muted grid"
      },
      "progress_bar": {
        "component": "Progress",
        "rule": "Progress fill uses emerald; track uses secondary; show % label right-aligned",
        "tailwind": "h-2 bg-secondary",
        "label": "text-xs text-muted-foreground tabular-nums"
      }
    },

    "daily_focus_planner": {
      "information_architecture": [
        "Monthly Goals (max 3) as compact cards",
        "Weekly Milestones as a list with completion toggles",
        "Daily Focus uses 1-3-5 sections with clear hierarchy",
        "Timeblocking inline on each task row (start/end)"
      ],
      "task_row": {
        "components": ["Checkbox", "Input", "Popover (time picker UI if needed)", "DropdownMenu"],
        "tailwind": {
          "row": "group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50",
          "title": "flex-1 text-sm text-foreground/90",
          "meta": "text-xs text-muted-foreground font-[family:var(--font-mono)]",
          "active": "ring-1 ring-emerald-500/30 bg-emerald-500/5"
        },
        "states": {
          "default": "muted text + no ring",
          "hover": "row background appears",
          "active_task": "emerald tint + ring",
          "completed": "line-through text-muted-foreground opacity-70"
        },
        "data_testids": {
          "task_checkbox": "task-complete-checkbox",
          "task_title_input": "task-title-input",
          "task_time_start": "task-time-start-input",
          "task_time_end": "task-time-end-input",
          "task_overflow_menu": "task-overflow-menu"
        }
      },
      "auto_rollover_suggestion": {
        "pattern": "End-of-day banner card with 2 actions: Move to Tomorrow / Move to Backlog",
        "component": "Alert + Button",
        "tailwind": "bg-secondary/60 border border-border rounded-xl p-4",
        "data_testids": {
          "rollover-banner": "rollover-suggestion-banner",
          "rollover-tomorrow": "rollover-move-tomorrow-button",
          "rollover-backlog": "rollover-move-backlog-button"
        }
      }
    },

    "focus_timer_drawer_visual": {
      "rule": "VISUAL only (no real timing logic required).",
      "component": "Drawer (mobile bottom) + Sheet (desktop right) depending on viewport",
      "layout": "Task title, session length chips (25/50), circular progress ring (visual), Start/Pause button (visual), notes textarea",
      "tailwind": {
        "drawer_panel": "bg-card border border-border rounded-t-2xl shadow-[var(--shadow-elev-2)]",
        "ring": "Use conic-gradient background on a div; keep subtle"
      },
      "data_testids": {
        "focus-drawer": "focus-timer-drawer",
        "focus-start": "focus-start-button",
        "focus-pause": "focus-pause-button",
        "focus-session-chip": "focus-session-length-chip"
      }
    },

    "growth_hub": {
      "top_cards": [
        "Streak (days)",
        "Total study time (week)",
        "Total exercise time (week)",
        "Completion rate (week)"
      ],
      "tracker_card": {
        "component": "Card",
        "layout": "Header: title + status badge; Body: metadata + progress; Footer: Quick Log button",
        "status_badges": {
          "BACKLOG": "Badge variant secondary",
          "IN_PROGRESS": "Badge with emerald outline",
          "COMPLETED": "Badge with emerald fill"
        },
        "quick_log": {
          "pattern": "Button opens Quick Log Sheet/Drawer prefilled with selected item",
          "data-testid": "tracker-quick-log-button"
        }
      },
      "backlog_accordion": {
        "component": "Accordion",
        "rule": "Backlog is collapsed by default; show counts in header; keep rows dense",
        "data_testids": {
          "backlog-accordion": "backlog-accordion",
          "backlog-item": "backlog-item-row"
        }
      },
      "quick_log_sheet": {
        "component": "Sheet (desktop) / Drawer (mobile)",
        "fields": [
          "Progress increment (number + unit)",
          "Optional Active Recall Hook (1 sentence)",
          "Date (Calendar popover)",
          "Save"
        ],
        "microcopy": "Keep helper text tiny and calm: ‘One sentence to remember what mattered.’",
        "data_testids": {
          "quick-log-sheet": "quick-log-sheet",
          "quick-log-increment": "quick-log-increment-input",
          "quick-log-note": "quick-log-active-recall-textarea",
          "quick-log-date": "quick-log-date-button",
          "quick-log-save": "quick-log-save-button"
        }
      }
    },

    "weekly_review_wizard": {
      "component": "Drawer wizard (mobile-first) or centered Card stepper (desktop)",
      "steps": [
        {
          "name": "Summary Dashboard",
          "content": "Output vs Input: tasks completed vs reading/study/exercise hours; small charts",
          "components": ["Card", "Tabs", "Recharts"],
          "data-testid": "weekly-review-step-summary"
        },
        {
          "name": "Qualitative Reflection",
          "content": "3 questions with Textarea; max-w-[65ch]",
          "components": ["Textarea"],
          "data-testid": "weekly-review-step-reflection"
        },
        {
          "name": "Work & Energy Balance",
          "content": "Indicator (simple 5-point slider) + short explanation",
          "components": ["Slider", "Tooltip"],
          "data-testid": "weekly-review-step-balance"
        },
        {
          "name": "Next Week Planner",
          "content": "Pull pending tasks from backlog; choose what becomes milestones",
          "components": ["Table", "Checkbox", "Button"],
          "data-testid": "weekly-review-step-next-week"
        }
      ],
      "stepper_ui": {
        "pattern": "Top: step title + small progress bar; Bottom: Back/Next buttons fixed within drawer",
        "tailwind": {
          "header": "pb-3 border-b border-border",
          "progress": "h-1.5 rounded-full bg-secondary overflow-hidden",
          "progress_fill": "bg-emerald-500",
          "footer": "pt-4 border-t border-border flex items-center justify-between gap-2"
        },
        "data_testids": {
          "wizard": "weekly-review-wizard",
          "next": "weekly-review-next-button",
          "back": "weekly-review-back-button",
          "finish": "weekly-review-finish-button"
        }
      }
    },

    "settings": {
      "pattern": "Simple form sections with separators; avoid clutter",
      "components": ["Card", "Switch", "Select", "Input"],
      "sections": [
        "Planner preferences (rollover behavior)",
        "Growth defaults (units, rating scale)",
        "Data (export/import placeholder)"
      ],
      "data_testids": {
        "settings-page": "settings-page",
        "settings-save": "settings-save-button"
      }
    },

    "empty_loading_error_states": {
      "loading": {
        "component": "Skeleton",
        "rule": "Use skeleton blocks matching final layout; avoid spinners except inside buttons",
        "data-testid": "loading-skeleton"
      },
      "empty": {
        "pattern": "Calm empty state card with 1 primary action; no illustrations needed",
        "tailwind": "border border-dashed border-border rounded-xl p-6 text-center",
        "data-testid": "empty-state"
      },
      "error": {
        "component": "Alert",
        "rule": "Short message + retry button; keep red minimal",
        "data-testid": "error-alert"
      }
    }
  },

  "motion_microinteractions": {
    "library": "framer-motion",
    "principles": [
      "Fast-in, soft-out; keep durations short",
      "Animate opacity + y for entrances; avoid large transforms",
      "Respect prefers-reduced-motion"
    ],
    "durations": {
      "fast": "120ms",
      "base": "180ms",
      "slow": "240ms"
    },
    "easings": {
      "standard": "[0.2, 0.8, 0.2, 1]",
      "emphasized": "[0.16, 1, 0.3, 1]"
    },
    "patterns": {
      "page_enter": "initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.18,ease:[0.2,0.8,0.2,1]}}",
      "card_hover": "whileHover={{y:-2}} transition={{duration:0.12}}",
      "drawer_open": "Use shadcn Drawer/Sheet built-in transitions; do not add global transition-all"
    }
  },

  "charts": {
    "library": "recharts",
    "usage": [
      "Weekly Review Step1: small bar for tasks completed per day; line for study/exercise minutes",
      "Growth Hub: tiny sparkline in KPI cards"
    ],
    "styling": {
      "grid": "stroke=hsl(var(--border)) opacity=0.6",
      "axis": "tick fill=hsl(var(--muted-foreground)) fontSize=12",
      "series": {
        "primary": "stroke #10b981",
        "secondary": "stroke rgba(250,250,250,0.35)"
      }
    },
    "empty_chart_state": "Show a Card with ‘No data yet this week’ + CTA to log progress."
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast for text on dark surfaces",
      "Visible focus states using ring + offset",
      "Keyboard navigable sidebar + wizard",
      "Use aria-label for icon-only buttons",
      "Respect prefers-reduced-motion"
    ],
    "focus_style": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  },

  "images": {
    "image_urls": [
      {
        "category": "background_texture",
        "description": "No external images required; use CSS noise overlay for premium texture.",
        "urls": []
      }
    ]
  },

  "instructions_to_main_agent": {
    "global": [
      "Remove default CRA App.css centering patterns; do not use .App { text-align:center }.",
      "Set dark mode as default by applying class 'dark' on the root html/body wrapper.",
      "Replace index.css tokens to match #09090b background and emerald accent; keep surfaces slightly lighter than background.",
      "All interactive and key informational elements MUST include data-testid in kebab-case.",
      "Use shadcn/ui components from /app/frontend/src/components/ui (no raw HTML dropdown/calendar/toast).",
      "Use lucide-react icons only.",
      "Use Sheet for desktop slide-overs; Drawer for mobile bottom sheets.",
      "Keep gradients minimal and only as ambient background wash in header/hero areas (<20% viewport)."
    ],
    "page_specific": {
      "/daily-focus": [
        "Implement 1-3-5 sections as three Cards stacked on mobile; two-column layout on desktop (tasks left, milestones/backlog right).",
        "Active task row gets emerald tint + ring; completed tasks are muted with line-through.",
        "Focus Timer is a visual Drawer/Sheet tied to active task."
      ],
      "/growth-hub": [
        "Top KPI cards row + tracker grid; each tracker card has progress bar + Quick Log.",
        "Backlog uses Accordion with counts."
      ],
      "/weekly-review": [
        "Use 4-step wizard with persistent footer nav; Step1 uses Recharts; Step2 uses Textareas with max width.",
        "Finish step produces next-week plan selection UI (Table + Checkbox)."
      ],
      "/settings": [
        "Use Card sections with separators; keep minimal."
      ]
    },
    "libraries": {
      "framer_motion": {
        "install": "npm i framer-motion",
        "usage": "Use motion.div for page transitions and card hover; respect prefers-reduced-motion."
      },
      "recharts": {
        "install": "npm i recharts",
        "usage": "Use small charts only; keep palette restrained (emerald + neutrals)."
      }
    }
  },

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
