---
phase: 04-analytics-dashboard
plan: "01"
subsystem: analytics-engine
tags: [analytics, tdd, csv-aggregation, gptw, enps, dashboard]
dependency_graph:
  requires:
    - src/lib/constants.ts (GPTW_QUESTIONS — 47 Likert question definitions)
    - src/lib/services/csv.service.ts (readRows for CSV access)
    - src/lib/services/token.service.ts (countSurveyTokens for response rate)
    - src/lib/types.ts (Question, Response, Token types)
  provides:
    - src/lib/types/analytics.ts (DashboardData, DepartmentBreakdownData)
    - src/lib/services/analytics.service.ts (computeAnalytics)
    - src/components/dashboard/SurveySelector.tsx (SurveySelector)
  affects:
    - src/app/[locale]/(admin)/admin/page.tsx (Plan 02 will wire computeAnalytics here)
    - src/components/dashboard/DashboardCharts.tsx (Plan 02 will update interface to match DashboardData)
tech_stack:
  added: []
  patterns:
    - TDD with vitest (vi.mock hoisting for csv.service and token.service)
    - Server-only analytics service (no 'use client')
    - Suspense boundary wrapping for useSearchParams (Next.js prerendering requirement)
    - Anonymity threshold pattern (5 responses minimum per segment)
key_files:
  created:
    - src/lib/types/analytics.ts
    - src/lib/services/analytics.service.ts
    - __tests__/services/analytics.service.test.ts
    - src/components/dashboard/SurveySelector.tsx
  modified:
    - src/lib/services/token.service.ts (added countSurveyTokens)
decisions:
  - "computeAnalytics accepts surveyId string and returns DashboardData | null — null when zero responses, not empty object"
  - "ENPS uses UNC-47 answers: promoters='4'|'5', passives='3', detractors='1'|'2' — matches GPTW Trust Index spec"
  - "innovationIds=[CRE-11, RES-38, RES-44, PRI-28], leadershipIds=[CRE-09, CRE-10, CRE-12, CRE-13, CRE-15] — discretionary groupings documented in code comments"
  - "SurveySelector wraps inner component (useSearchParams) in Suspense — required by Next.js for prerendering parent server components"
  - "base-ui Select.Root onValueChange passes (value | null, eventDetails) — guard with if (!surveyId) return in handler"
  - "Empty string CSV answers filtered before favorableScore denominator — avoids division by wrong total"
  - "DashboardData type includes departmentBreakdown field not in DashboardCharts.tsx yet — Plan 02 updates the chart component"
metrics:
  duration: "4 min"
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 4 Plan 01: Analytics Engine + SurveySelector Summary

**One-liner:** Server-side `computeAnalytics()` computes EES, ENPS, sentiment, dimension scores, department breakdown from real CSV response data with anonymity threshold enforcement.

## What Was Built

### Task 1: Analytics Types + Service (TDD)

**`src/lib/types/analytics.ts`** — Exports two interfaces:
- `DashboardData`: Full dashboard payload (eesScore, eesTrend, gptwScore, responseRate, totalResponses, dimensions[5], sentiment, enps, strengths[10], opportunities[10], leaderboard[11], departmentBreakdown)
- `DepartmentBreakdownData`: Segments with anonymity-guarded dimension scores and anonymityThreshold=5

**`src/lib/services/analytics.service.ts`** — Exports `computeAnalytics(surveyId)`:
- Returns `null` for zero responses
- Computes `favorableScore()` per question (filters empty strings before denominator)
- EES = mean % favorable across all 47 Likert questions
- GPTW score = `favorableScore('UNC-47')`
- ENPS: promoters(4|5)%, passives(3)%, detractors(1|2)%, score = promoters - detractors
- 5 dimension scores (camaraderie, credibility, fairness, pride, respect) in Title Case
- Sentiment counts positive/neutral/negative across ALL Likert answers
- Strengths: top 10 questions by % favorable; Opportunities: bottom 10
- Leaderboard: 11 items with hardcoded DIMENSION_COLORS values
- Innovation composite: CRE-11, RES-38, RES-44, PRI-28
- Leadership composite: CRE-09, CRE-10, CRE-12, CRE-13, CRE-15
- Department breakdown: groups by DEM-ORG; segments < 5 rows get null dimension scores

**`src/lib/services/token.service.ts`** — Added `countSurveyTokens(surveyId)`:
- Reads `tokens-{surveyId}.csv`, returns `rows.length` (all statuses)
- Used as denominator for response rate: `Math.round(responses / tokens * 100)`

**`__tests__/services/analytics.service.test.ts`** — 5 unit tests, all passing:
- Test 1 (DASH-01): eesScore = mean % favorable across 47 questions = `Math.round(200/47)` = 4
- Test 2 (DASH-04/ENPS): 6 promoters + 2 passives + 2 detractors → score=40, promoters=60, passives=20, detractors=20
- Test 3 (DATA-04): Wave Money (3 rows) → null dimensions; Yoma Bank (8 rows) → computed dimensions
- Test 4: empty responses → null
- Test 5 (pitfall guard): empty string excluded from denominator → 1 valid answer gives 100% not 50%

### Task 2: SurveySelector Client Component

**`src/components/dashboard/SurveySelector.tsx`** — Exports `SurveySelector`:
- `'use client'` component with `useRouter`, `usePathname`, `useSearchParams`
- Wrapped in `<Suspense>` boundary (Next.js requirement for prerendering parent server components)
- `handleChange` builds `new URLSearchParams(searchParams.toString())`, sets `survey` param, pushes `${pathname}?${params}`
- Never hardcodes `/en/admin` — always uses `pathname` from `usePathname()`
- Renders `<p className="text-sm text-muted-foreground">No surveys yet</p>` when `surveys.length === 0`
- Fallback: animated skeleton div while Suspense resolves

## Actual Exports (for Plan 02)

```typescript
// src/lib/types/analytics.ts
export interface DashboardData { ... }
export interface DepartmentBreakdownData { ... }

// src/lib/services/analytics.service.ts
export async function computeAnalytics(surveyId: string): Promise<DashboardData | null>

// src/lib/services/token.service.ts (addition)
export async function countSurveyTokens(surveyId: string): Promise<number>

// src/components/dashboard/SurveySelector.tsx
export function SurveySelector({ surveys, activeSurveyId }: SurveySelectorProps): JSX.Element
// Props: surveys: { id: string; name: string }[], activeSurveyId: string | undefined
```

## Key Decisions Made

1. **base-ui Select `onValueChange` signature**: Passes `(value | null, eventDetails)`. Handler guards with `if (!surveyId) return` — matches established codebase pattern (STATE.md decision from Phase 03).

2. **FAI questions are FAI-18..FAI-25 (8 total), PRI questions are PRI-26..PRI-35 (10 total)**: The constants.ts was the authoritative source — confirmed 47 total via `grep -c "type: 'likert'"`. Plan comment said FAI-18..26 and PRI-27..35 but actual file differs.

3. **`DashboardData.departmentBreakdown` is new vs existing `DashboardCharts.tsx` interface**: Plan 02 must update `DashboardCharts.tsx` to use `departmentBreakdown` or cast. Plan 01 types are authoritative.

4. **Suspense boundary wraps inner component, not exported component**: The exported `SurveySelector` is the Suspense wrapper. This allows callers to render it without their own Suspense.

5. **Test mocks two modules**: `csv.service` AND `token.service` both mocked via `vi.mock` — necessary because `analytics.service` imports from both.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FAI/PRI question ID range discrepancy in plan description**
- **Found during:** Task 1 (reading constants.ts)
- **Issue:** Plan said "FAI-18..FAI-26, PRI-27..PRI-35" in comments but actual constants.ts has FAI-18..25 and PRI-26..35. Total Likert count is still 47.
- **Fix:** Used `GPTW_QUESTIONS.filter(q => q.type === 'likert')` — derived IDs from constants directly, not from hardcoded plan ranges. Zero impact on behavior.
- **Files modified:** None (auto-handled by code design)

None — all 5 tests pass, zero TypeScript errors, plan executed as written.

## Self-Check: PASSED

All created files exist on disk. Both task commits verified in git log.

| Item | Status |
|------|--------|
| src/lib/types/analytics.ts | FOUND |
| src/lib/services/analytics.service.ts | FOUND |
| src/components/dashboard/SurveySelector.tsx | FOUND |
| __tests__/services/analytics.service.test.ts | FOUND |
| commit 58c6128 (Task 1) | FOUND |
| commit 1b178dc (Task 2) | FOUND |
