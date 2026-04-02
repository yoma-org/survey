---
phase: quick
plan: 260402-qe7
subsystem: admin-dashboard, admin-sidebar, survey-form
tags: [ui-ux, dashboard, filters, sidebar, emoji, analytics]
dependency_graph:
  requires: []
  provides: [dashboard-org-filter, sidebar-survey-link, survey-detail-switcher, likert-emoji-scale]
  affects: [admin-dashboard, admin-sidebar, survey-detail, public-survey-form]
tech_stack:
  added: []
  patterns: [org-filter-cache-key, client-filter-component-with-suspense]
key_files:
  created:
    - src/components/dashboard/DashboardFilters.tsx
  modified:
    - src/app/[locale]/(admin)/admin/page.tsx
    - src/app/[locale]/(admin)/layout.tsx
    - src/app/[locale]/(admin)/admin/surveys/[id]/page.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/components/admin/SurveyDetailClient.tsx
    - src/components/dashboard/LeaderboardGrid.tsx
    - src/components/survey/LikertInput.tsx
    - src/lib/services/analytics.service.ts
    - src/lib/cache.ts
    - src/app/globals.css
decisions:
  - cachedComputeAnalytics cache key includes org suffix to prevent cross-org cache pollution
  - LeaderboardGrid removed 'use client' directive — no state/hooks needed after marquee removal
  - SurveyDetailClient renders survey switcher above Back link for logical navigation hierarchy
metrics:
  duration: 20 min
  completed_date: "2026-04-02T12:08:28Z"
  tasks_completed: 3
  files_modified: 10
---

# Quick Task 260402-qe7: UI/UX Improvements — Dashboard Filters Summary

**One-liner:** Dashboard org filter with cache key isolation, sidebar surveys->detail shortcut with settings in footer, and emoji-enhanced Likert scale.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Dashboard improvements — default survey, org filter, static marquee | 91b6033 | DashboardFilters.tsx (created), admin/page.tsx, analytics.service.ts, cache.ts, LeaderboardGrid.tsx, globals.css |
| 2 | Sidebar changes + survey detail dropdown | a318545 | AdminSidebar.tsx, layout.tsx, surveys/[id]/page.tsx, SurveyDetailClient.tsx |
| 3 | Public survey emoji scoring | 983946d | LikertInput.tsx |

## Changes Detail

### Task 1: Dashboard improvements

**Default survey selection:** Changed `surveys[0]?.id` to `surveys.filter(s => s.status === 'active').at(-1)?.id ?? surveys.at(-1)?.id` — picks the most recently created active survey.

**Org filter:** Created `DashboardFilters.tsx` client component with two Select dropdowns (survey + org). `computeAnalytics(surveyId, org?)` now filters rows by `DEM-ORG` before all score computations. Cache key format: `analytics-{surveyId}-{org|all}`.

**Static marquee:** `LeaderboardGrid` converted from duplicated items + CSS animation to a simple `flex flex-wrap` layout. Removed `'use client'` directive. Deleted marquee CSS block from globals.css.

### Task 2: Sidebar + survey detail

**Sidebar surveys link:** `AdminSidebar` accepts `latestActiveSurveyId?: string` prop. Surveys nav item href resolves to `admin/surveys/{id}` when a latest active survey exists. Active state detection uses `pathname.includes('/admin/surveys')`.

**Settings in footer:** Removed settings from `navItems`. Added a `<Link>` with Settings icon in the footer alongside the Sign Out button. Footer uses `flex` layout, with Sign Out taking `flex-1`.

**Survey detail dropdown:** `SurveyDetailClient` now receives `surveys` prop and renders a `<Select>` at the top of the page to switch between surveys via `router.push`.

### Task 3: Emoji Likert scale

Added `emoji` field to each `LIKERT_OPTIONS` entry: 😡 (1), 😟 (2), 😐 (3), 😊 (4), 🤩 (5). Emojis rendered before text labels in both desktop chips and mobile rows.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- [x] src/components/dashboard/DashboardFilters.tsx — FOUND
- [x] src/components/dashboard/LeaderboardGrid.tsx — modified, no 'use client'
- [x] src/components/admin/AdminSidebar.tsx — accepts latestActiveSurveyId prop
- [x] src/components/survey/LikertInput.tsx — emoji field in LIKERT_OPTIONS
- [x] Commits 91b6033, a318545, 983946d — all exist
