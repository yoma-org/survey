# Phase 4: Analytics Dashboard - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin selects a survey and views a full analytics dashboard with GPTW dimension scores computed from real CSV responses. Includes overall EES score, Positive/Neutral/Negative donut, 5-dimension bar chart, ENPS gauge, Top 10/Bottom 10 statement rankings, department/demographic breakdowns, and leaderboard metrics. All analytics computed server-side. Replaces the demo data currently in the dashboard.

</domain>

<decisions>
## Implementation Decisions

### Analytics Computation
- Server-side computation in analytics.service.ts — reads response CSV, aggregates, passes pre-computed JSON to client chart components
- Empty survey (no responses): show empty state with "No responses yet" message and illustration — do NOT show 0% charts
- Anonymity threshold: minimum 5 responses per segment for department/demographic breakdowns — segments below threshold show "Insufficient data"
- Survey selector: dropdown at top of dashboard page, admin selects which survey to view

### Chart Layout & Interactions
- Staggered fade-in animation per section using existing FadeIn component + recharts built-in animation
- Hover interaction: recharts tooltip only — clean, not distracting
- Department breakdown: grouped bar chart, one bar per dimension per department
- Print/export: NOT in v1 — defer to v2

### Claude's Discretion
- Exact analytics computation formulas (% favorable = count of 4+5 / total × 100 is established)
- Chart aspect ratios and responsive breakpoints
- Empty state illustration style
- Loading skeleton design during computation
- Error handling for malformed CSV data

</decisions>

<canonical_refs>
## Canonical References

### Existing Dashboard Components (MUST extend, not rewrite)
- `src/components/dashboard/DashboardCharts.tsx` — current dashboard layout with demo data, already uses recharts
- `src/components/dashboard/MetricCard.tsx` — metric display with CountUp animation
- `src/components/dashboard/LeaderboardGrid.tsx` — scrolling marquee ticker
- `src/components/dashboard/ChartSection.tsx` — borderless chart wrapper
- `src/components/dashboard/ErrorBoundary.tsx` — chart error boundary
- `src/components/charts/DimensionBarChart.tsx` — recharts bar chart
- `src/components/charts/ResponseDonutChart.tsx` — recharts donut with center label
- `src/components/charts/ENPSGauge.tsx` — recharts semicircle gauge
- `src/components/charts/HorizontalBarRanking.tsx` — CSS progress bar ranking
- `src/lib/chart-colors.ts` — shared color palette

### Data Layer
- `src/lib/services/csv.service.ts` — readRows for CSV data
- `src/lib/services/survey.service.ts` — getSurvey, getQuestions, listSurveys
- `src/lib/constants.ts` — GPTW_QUESTIONS, dimension/sub-pillar mappings
- `src/lib/types.ts` — Survey, Question, Response types

### Design Reference
- `.planning/UX-DESIGN-SPEC.md` — Section 9 (Admin Dashboard UX), dashboard hierarchy

</canonical_refs>

<code_context>
## Existing Code Insights

### What Already Exists
- Full dashboard UI with demo data — DashboardCharts renders MetricCards, LeaderboardGrid, dimension bar chart, donut, ENPS gauge, and rankings
- All chart components use shadcn/ui charts (Recharts) — already migrated from chart.js
- Scattered pixel canvas background
- Motion animations (FadeIn, StaggerChildren, CountUp)
- Admin page conditionally shows onboarding checklist or dashboard

### What Needs to Be Built
- `analytics.service.ts` — reads responses CSV, computes all metrics
- Replace demo data in admin/page.tsx with real computed analytics
- Survey selector dropdown on dashboard
- Department breakdown chart (new component)
- UIUX-02: subtle background animation (already done — scattered pixels)
- DATA-04: anonymity threshold enforcement (segments < 5 hidden)

### Integration Points
- Admin page.tsx currently has hardcoded demoData object — replace with analytics.service call
- DashboardCharts accepts a DashboardData interface — analytics.service must produce this exact shape

</code_context>

<specifics>
## Specific Ideas

- The DashboardData interface in DashboardCharts.tsx is already the target schema — analytics.service must produce data matching it exactly
- ENPS calculation: statements don't include an explicit 0-10 NPS question — compute ENPS from overall satisfaction (statement 47 "great place to work") mapping 4-5 as promoters, 3 as passives, 1-2 as detractors
- Department breakdowns use the Organization demographic field (Wave Money vs Yoma Bank)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-analytics-dashboard*
*Context gathered: 2026-04-01*
