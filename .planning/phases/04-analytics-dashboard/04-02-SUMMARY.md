---
phase: 04-analytics-dashboard
plan: 02
subsystem: ui
tags: [recharts, analytics, dashboard, next.js, server-component]

requires:
  - phase: 04-analytics-dashboard plan 01
    provides: computeAnalytics(), DashboardData type, DepartmentBreakdownData type, SurveySelector component

provides:
  - DepartmentBreakdownChart: grouped horizontal BarChart showing GPTW dimension scores per org segment
  - DashboardCharts: extended layout with DepartmentBreakdownChart section, DashboardData imported from analytics.ts
  - admin/page.tsx: fully wired server component — awaits searchParams, calls computeAnalytics, renders SurveySelector + empty state

affects: [future-admin-features, analytics-extensions]

tech-stack:
  added: []
  patterns:
    - Server component awaits searchParams Promise (Next.js 15+ breaking change)
    - computeAnalytics null guard — empty state renders when survey has no responses
    - recharts custom TooltipEntry interface for null-safe tooltip content
    - DepartmentBreakdownChart uses layout=vertical BarChart — one row per GPTW dimension, one Bar series per org segment

key-files:
  created:
    - src/components/dashboard/DepartmentBreakdownChart.tsx
  modified:
    - src/components/dashboard/DashboardCharts.tsx
    - src/app/[locale]/(admin)/admin/page.tsx

key-decisions:
  - "Custom TooltipEntry interface (not recharts TooltipProps generic) — TooltipProps<number|null, string> fails because null violates ValueType constraint"
  - "DashboardCharts imports DashboardData from @/lib/types/analytics, not inline interface — single source of truth required once departmentBreakdown field added"
  - "admin/page.tsx preserves full onboarding checklist JSX when surveys.length === 0 — no behavioral change, just new function signature"

patterns-established:
  - "null-safe recharts tooltip: define custom props interface instead of using TooltipProps generics"
  - "server component searchParams: always await the Promise, destructure after"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, DASH-11, DASH-12, UIUX-02, DATA-04]

duration: 4min
completed: 2026-04-01
---

# Phase 4 Plan 02: Analytics Dashboard Wiring Summary

**DepartmentBreakdownChart + admin page fully wired to computeAnalytics() — demo data removed, real CSV responses drive all dashboard charts**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-01T13:25:45Z
- **Completed:** 2026-04-01T13:29:36Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Created `DepartmentBreakdownChart` — grouped horizontal BarChart with recharts, one dimension row per GPTW pillar, one bar series per org segment, custom null-safe tooltip displaying "Insufficient data (< 5 responses)"
- Updated `DashboardCharts` to import `DashboardData` from `@/lib/types/analytics` (replacing inline interface without `departmentBreakdown` field), added DepartmentBreakdownChart section after rankings
- Rewrote `admin/page.tsx` as proper Next.js 15+ server component — awaits searchParams Promise, calls `computeAnalytics(activeSurveyId)`, renders `SurveySelector` + empty state when null, full demoData removal

## Task Commits

1. **Task 1: DepartmentBreakdownChart component** - `cb04e90` (feat)
2. **Task 2: Wire DashboardCharts + admin page to real analytics** - `f3175a4` (feat)

## Files Created/Modified

- `src/components/dashboard/DepartmentBreakdownChart.tsx` — new grouped horizontal BarChart for org segment dimension breakdown
- `src/components/dashboard/DashboardCharts.tsx` — DashboardData type from analytics.ts; added DepartmentBreakdownChart section
- `src/app/[locale]/(admin)/admin/page.tsx` — rewritten to await searchParams, call computeAnalytics, SurveySelector, empty state

## Decisions Made

- Used custom `TooltipEntry` interface instead of recharts `TooltipProps<number | null, string>` because `null` is not assignable to recharts `ValueType` — this was a Rule 1 auto-fix (TypeScript error during verification)
- Preserved complete onboarding JSX in the `surveys.length === 0` branch — no behavioral change; both branches now live inside the same function with Promise searchParams signature

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed recharts TooltipProps TypeScript incompatibility with null values**
- **Found during:** Task 1 (DepartmentBreakdownChart component) during `npx tsc --noEmit`
- **Issue:** `TooltipProps<number | null, string>` fails — null not assignable to recharts `ValueType`; also payload/label not on that type
- **Fix:** Replaced `TooltipProps` import and generic usage with a local `CustomTooltipProps` interface that accepts `value?: number | string | null`
- **Files modified:** src/components/dashboard/DepartmentBreakdownChart.tsx
- **Verification:** `npx tsc --noEmit` exits 0 after fix
- **Committed in:** cb04e90 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 type bug)
**Impact on plan:** Necessary for TypeScript correctness. No scope change.

## Issues Encountered

None beyond the auto-fixed TypeScript tooltip type issue.

## Next Phase Readiness

- Phase 4 is complete — all DASH-01 through DASH-12, UIUX-02, DATA-04 requirements satisfied
- The analytics dashboard is fully live: admin selects survey from dropdown, real CSV response data flows through computeAnalytics into every chart
- No remaining blockers for v1.0 milestone

---
*Phase: 04-analytics-dashboard*
*Completed: 2026-04-01*
