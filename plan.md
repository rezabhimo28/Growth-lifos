# plan.md

## 1. Objectives
- Deliver an MVP “Personal Growth & LifeOS” with **Daily Focus**, **Growth Hub**, **Weekly Review**, and **Settings** using **React + FastAPI + MongoDB**.
- Provide a distraction-free **Dark Mode** UI (Tailwind + shadcn/ui + lucide-react + framer-motion) with responsive sidebar layout.
- Implement persistent CRUD + analytics for: goals→milestones→daily tasks, content trackers + progress logs, fitness logs, weekly reviews.
- Ensure core flows feel fast: inline edits, quick-log bottom sheet, smooth micro-animations, sensible empty/loading/error states.

## 2. Implementation Steps

### Phase 1: Core POC (SKIPPED — no external integrations; standard CRUD + UI)
- Proceed directly to V1 build; validate core flows via incremental end-to-end testing during development.

### Phase 2: V1 App Development — ✅ COMPLETED (E2E tested: backend 100% / 58 tests, frontend 95%; core flows verified)
**Backend (FastAPI + MongoDB)**
- Define Mongo collections + indexes: `users (single default)`, `monthly_goals`, `weekly_milestones`, `daily_tasks`, `content_library`, `progress_logs`, `fitness_logs`, `weekly_reviews`.
- Implement Pydantic schemas + CRUD endpoints:
  - Daily Focus: goals/milestones/tasks, reorder, status, rollover suggestion endpoints.
  - Growth Hub: content items, progress logs (increment + active recall note), fitness logs.
  - Weekly Review: create/get latest, step-save/complete, pull pending tasks.
  - Dashboard endpoints: streak, totals, weekly aggregates.
- Add basic validation + consistent API error format.

**Frontend (React + Tailwind + shadcn/ui)**
- App shell: collapsible sidebar nav + routes:
  - `/daily-focus`, `/growth-hub`, `/weekly-review`, `/settings`.
- Data layer: typed API client + React context/hooks (Zustand-style) with cache + optimistic updates for quick actions.
- Global UI: dark theme tokens (#09090b bg, #10b981 accent), skeleton loaders, empty states.

**Daily Focus (/daily-focus)**
- UI sections: Monthly Goals (max 3) → Weekly Milestones → Today’s 1-3-5 tasks.
- Timeblocking fields on tasks (start/end), quick set buttons.
- Pomodoro drawer for active task (visual timer): start/pause/reset, session count.
- Rollover suggestions at day end (incomplete → tomorrow) and week end (milestones/tasks → next week).

**Growth Hub (/growth-hub) — per requirements**
- Top cards: Weekly Streak + Total Study/Exercise Time.
- Active Trackers grid: progress bars, % label, status chip, **+ Quick Log**.
- Quick Log slide-over/bottom sheet: increment value + 1-sentence Active Recall hook; submit writes ProgressLog + updates Content current_progress.
- Backlog accordion: saved items grouped by type/status.
- Fitness quick add: activity + duration + metrics.

**Weekly Review (/weekly-review)**
- 4-step wizard stepper with saved progress:
  1) Summary dashboard (Output vs Input metrics)
  2) Reflection (3 Qs)
  3) Work/Energy balance indicator
  4) Next week planner (pull pending tasks; choose carry-over)

**Settings (/settings)**
- Simple MVP settings: week start day, default pomodoro length, accent intensity (optional), data export (JSON) if time permits.

**Phase 2 testing (mandatory)**
- Run 1 full E2E pass: create goals→milestones→tasks; complete some; rollover; add trackers; quick-log; add fitness; complete weekly review; verify dashboard aggregates.

**Phase 2 user stories (at least 5)**
1. As a user, I can set up to 3 monthly goals and see them cascade into weekly milestones and today’s priorities.
2. As a user, I can plan my day using the 1-3-5 rule and timeblock tasks so I know what to do next.
3. As a user, I can start a visual focus timer for the task I’m working on without leaving the page.
4. As a user, I can quick-log reading/study progress with a short active-recall note in under 10 seconds.
5. As a user, I can run a weekly review wizard that summarizes my week and helps me carry unfinished work forward.

### Phase 3: Stabilization + UX Polish + Production Hardening (then 1 E2E test pass)
- Improve performance: list virtualization where needed, debounce writes, better optimistic conflict handling.
- Quality UX: keyboard shortcuts (quick add, search), drag/drop ordering for tasks/milestones, richer empty states.
- Analytics polish: more accurate streak logic, weekly aggregation correctness, timezone-safe dates.
- Reliability: request retry/backoff, global error boundary, API pagination where needed.
- Data hygiene: migration-safe defaults, unique indexes, soft-delete if needed.

**Phase 3 user stories (at least 5)**
1. As a user, I can reorder tasks and milestones via drag-and-drop to match my real priorities.
2. As a user, I can recover gracefully from network hiccups without losing my edits.
3. As a user, I can navigate and add items via keyboard to stay in flow.
4. As a user, I can quickly find a tracker or task using search and filters.
5. As a user, I can trust streaks/totals because dates and timezones behave correctly.

### Phase 4+: Expansion (optional, only after approval; include testing each phase)
- Templates (repeatable weekly plans), richer timeblocking calendar view, reminders (local only), export/import.
- Multi-user + auth (if ever needed) as a separate phase due to testing overhead.

**Phase 4 user stories (at least 5)**
1. As a user, I can save my ideal weekly plan as a template and reuse it.
2. As a user, I can view timeblocks on a simple calendar timeline.
3. As a user, I can export all my data to JSON/CSV for backup.
4. As a user, I can import previously exported data to restore my setup.
5. As a user, I can enable optional reminders to nudge me back to my Big Win.

## 3. Next Actions
- Confirm final field details for timeblocking + rollover rules (e.g., allowed statuses, what “pending” means).
- Implement backend models + endpoints first, then wire frontend routes + UI.
- Build Growth Hub page early (highest UI complexity) and connect quick-log end-to-end.
- Complete remaining modules, then run Phase 2 E2E test pass.

## 4. Success Criteria
- All routes render correctly (desktop + mobile) with cohesive dark minimalist UI.
- CRUD works with real Mongo persistence for all collections; no mock-only flows.
- Daily Focus supports 1-3-5 tasks, timeblocking fields, active task timer drawer, and rollover suggestions.
- Growth Hub meets the specified UI requirements (top cards, active grid, quick-log modal, backlog accordion) and logs update progress accurately.
- Weekly Review wizard persists step state, computes summary metrics, and can pull/carry pending tasks.
- One full E2E pass completes without broken flows or data inconsistencies.