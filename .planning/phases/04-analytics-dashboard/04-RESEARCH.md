# Phase 4: Analytics Dashboard - Research

**Researched:** 2026-04-01
**Domain:** Server-side analytics computation + React dashboard wiring
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Server-side computation in `analytics.service.ts` — reads response CSV, aggregates, passes pre-computed JSON to client chart components
- Empty survey (no responses): show empty state with "No responses yet" message and illustration — do NOT show 0% charts
- Anonymity threshold: minimum 5 responses per segment for department/demographic breakdowns — segments below threshold show "Insufficient data"
- Survey selector: dropdown at top of dashboard page, admin selects which survey to view
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Admin dashboard showing overall Employee Engagement Score (EES) as % favorable | EES = mean of all 47 Likert responses that score 4 or 5 / total Likert responses |
| DASH-02 | Pie/donut chart showing Positive/Neutral/Negative distribution | ResponseDonutChart already exists — wire `{ positive, neutral, negative }` from analytics.service |
| DASH-03 | Bar chart showing 5 dimension scores as % favorable | DimensionBarChart already exists — wire `dimensions[]` array from analytics.service |
| DASH-04 | ENPS visualization as gauge | ENPSGauge already exists — wire `{ score, promoters, passives, detractors }` from analytics.service; ENPS uses UNC-47 mapping |
| DASH-05 | Top 10 Strengths as horizontal bar chart | HorizontalBarRanking already exists — derive from per-statement % favorable, sort desc, take 10 |
| DASH-06 | Bottom 10 Opportunities as horizontal bar chart | HorizontalBarRanking already exists — same list sorted asc, take 10 |
| DASH-07 | Department/organization breakdown charts per group | New DepartmentBreakdownChart component needed — grouped bar chart using DEM-ORG values |
| DASH-08 | Leaderboard metrics (11 items) | LeaderboardGrid already exists — wire 11-item array from analytics.service |
| DASH-09 | Charts use recharts with proper client-side rendering | Already done — all chart components are 'use client' with shadcn/ui chart wrappers |
| DASH-10 | IntersectionObserver lazy instantiation + useEffect cleanup | LazyChart.tsx already provides this infrastructure |
| DASH-11 | Analytics data aggregated server-side, passed as props | analytics.service.ts (new) runs in server component admin/page.tsx |
| DASH-12 | Admin can filter/view by survey selection | SurveySelector client component + URL searchParam `?survey=<id>` |
| UIUX-02 | Subtle background animation effects | Already implemented — scattered pixel canvas background (confirmed in CONTEXT.md) |
| DATA-04 | Anonymity threshold — segments hidden when count < 5 | Enforced in analytics.service.ts during department breakdown computation |
</phase_requirements>

---

## Summary

Phase 4 is primarily a data-wiring phase, not a UI-build phase. All chart components already exist and accept typed props. The central task is building `analytics.service.ts` that reads `responses-{surveyId}.csv`, computes every metric the `DashboardData` interface requires, and returns that object for the server component to pass down.

The CSV response format is confirmed: each row contains metadata columns (`surveyId`, `token`, `email`, `submittedAt`) followed by one column per question ID (e.g., `CAM-01`, `CRE-09`, `FAI-18`, `DEM-ORG`, `DEM-YEAR`, `DEM-ROLE`, `OE-01`, `OE-02`). Likert answers are `"1"` through `"5"` as strings (CSV safety). Open-ended and demographic values are strings.

Three new artifacts are needed beyond the service: (1) a `SurveySelector` client component that updates URL searchParams to drive survey selection, (2) a `DepartmentBreakdownChart` for DASH-07, and (3) an empty-state component for surveys with zero responses.

**Primary recommendation:** Build `analytics.service.ts` first — every other change in this phase depends on it. The `DashboardData` interface in `DashboardCharts.tsx` is the exact target schema; make the service output match it without modifying the interface.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| papaparse | Already installed | CSV parsing via `readRows()` | Already used in csv.service.ts — do NOT import papaparse directly, use readRows |
| recharts | Already installed | All chart rendering | All chart components already use recharts via shadcn/ui |
| next-intl | Already installed | Server/client translations | Established pattern: `getTranslations()` server, `useTranslations()` client |
| next/navigation | Built-in | `useSearchParams`, `useRouter` for survey selector URL state | App Router standard |

### No New Dependencies Required
This phase adds zero new npm packages. Everything needed is already installed.

---

## Architecture Patterns

### Target Data Flow

```
admin/page.tsx (Server Component)
  |
  ├── listSurveys()              → survey dropdown options
  ├── analytics.service.ts       → DashboardData (computed from CSV)
  |     └── readRows(`responses-{id}.csv`)
  |
  ├── <SurveySelector surveys={...} />   (client, updates ?survey= URL param)
  └── <DashboardCharts data={...} />     (client, existing — no changes needed)
        └── DepartmentBreakdownChart     (new client component, inside DashboardCharts)
```

### Survey Selection Pattern — URL SearchParams

Survey selection must survive page refresh and be shareable. Use `?survey=<id>` in the URL.

- `admin/page.tsx` reads `searchParams.survey` (Next.js App Router server component prop)
- `SurveySelector` is a `'use client'` component using `useSearchParams()` + `useRouter().push()`
- Changing survey triggers full page re-render (server component re-runs with new searchParam)
- Default: most recently created survey (surveys are sorted by `createdAt` descending)

```typescript
// admin/page.tsx
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string }>
}) {
  const { survey: surveyId } = await searchParams;
  const surveys = await listSurveys();
  const activeSurveyId = surveyId ?? surveys[0]?.id;
  const analyticsData = activeSurveyId
    ? await computeAnalytics(activeSurveyId)
    : null;
  // ...
}
```

**Note:** `searchParams` is a Promise in Next.js 15+ App Router — must be awaited.

### analytics.service.ts — Computation Architecture

```typescript
// src/lib/services/analytics.service.ts
export async function computeAnalytics(surveyId: string): Promise<DashboardData | null>
```

Internal pipeline:
1. `readRows<Record<string,string>>(`responses-${surveyId}.csv`)` — returns `[]` if no file
2. If `rows.length === 0` return `null` (triggers empty state)
3. Filter rows to only Likert question columns (exclude metadata + demographics + open-ended)
4. Compute per-question % favorable → used for EES, dimensions, strengths, opportunities
5. Compute per-dimension aggregates → `dimensions[]`
6. Compute sentiment (positive/neutral/negative)
7. Compute ENPS from UNC-47
8. Compute department breakdowns with anonymity threshold enforcement
9. Return assembled `DashboardData` object

### DashboardData Interface (MUST match exactly — do NOT modify)

```typescript
// From DashboardCharts.tsx — this is the contract
interface DashboardData {
  eesScore: number;                    // % favorable across all 47 Likert
  eesTrend: number;                    // hardcode 0 — no multi-survey comparison in v1
  gptwScore: number;                   // % favorable on UNC-47 alone ("great place to work")
  responseRate: number;                // submitted tokens / total tokens × 100
  totalResponses: number;              // rows.length
  dimensions: { dimension: string; score: number }[];     // 5 items, Title Case
  sentiment: { positive: number; neutral: number; negative: number };
  enps: { score: number; promoters: number; passives: number; detractors: number };
  strengths: { label: string; score: number }[];          // top 10 by % favorable
  opportunities: { label: string; score: number }[];      // bottom 10 by % favorable
  leaderboard: { label: string; value: number; color: string }[];  // 11 items
}
```

The `DashboardCharts.tsx` interface is NOT exported — analytics.service.ts must define its own matching type or the page passes it inline. Recommend exporting `DashboardData` from `DashboardCharts.tsx` so analytics.service can import the type.

### Department Breakdown — New Component

`DepartmentBreakdownChart` needs to be created. It is NOT currently in DashboardCharts.tsx. The interface for its data:

```typescript
interface DepartmentBreakdownData {
  segments: {
    segmentLabel: string;                       // e.g. "Wave Money", "Yoma Bank"
    dimensions: { dimension: string; score: number | null }[];  // null = insufficient data
    responseCount: number;
  }[];
  anonymityThreshold: number;   // always 5
}
```

`DashboardData` interface must be extended to include department breakdown, or passed separately. Since `DashboardCharts.tsx` does not currently have a `departmentBreakdown` field, the planner should add it.

### Computation Formulas (Locked)

**% Favorable (per statement):**
```
favorableScore(questionId) = count(rows where answers[questionId] is "4" or "5") / count(rows where answers[questionId] !== "") × 100
```

**EES Score:**
```
eesScore = mean of favorableScore across all 47 Likert question IDs (CAM-01 through UNC-47)
```

**Dimension Score:**
```
dimensionScore(dim) = mean of favorableScore for all questions where dimension === dim
```

**Sentiment:**
```
positive = count(answer "4" or "5") / total Likert answers × 100  [same as % favorable]
neutral  = count(answer "3") / total × 100
negative = count(answer "1" or "2") / total × 100
```
Note: compute across ALL Likert answers (all questions × all responses, not per-response averages).

**ENPS (from CONTEXT.md specifics — uses UNC-47):**
```
promoters  = count(UNC-47 === "4" or "5") / total UNC-47 responses × 100
passives   = count(UNC-47 === "3") / total × 100
detractors = count(UNC-47 === "1" or "2") / total × 100
score      = promoters% - detractors%  (ENPS is a signed integer, range -100 to +100)
```

**GPTW Score (gptwScore):**
```
gptwScore = favorableScore("UNC-47")
```

**Response Rate:**
```
responseRate = totalResponses / totalTokensIssued × 100
```
Requires `token.service.ts` to expose a count for the survey. Current `getResponseCount` in survey.service.ts reads responses CSV. Need to also read tokens CSV to get denominator.

**Leaderboard (11 metrics, from demo data pattern):**
| Label | Computation |
|-------|-------------|
| Completion | responseRate |
| Credibility | dimensionScore('credibility') |
| Respect | dimensionScore('respect') |
| Fairness | dimensionScore('fairness') |
| Pride | dimensionScore('pride') |
| Camaraderie | dimensionScore('camaraderie') |
| Satisfaction | favorableScore('UNC-47') (same as gptwScore) |
| ENPS | enps.score (signed — display as signed integer) |
| Engagement | eesScore |
| Innovation | mean of CRE-11, RES-38, RES-44 (innovation-adjacent questions) |
| Leadership | mean of CRE-09, CRE-10, CRE-13 (leadership-adjacent questions) |

**Innovation and Leadership sub-scores:** Not explicitly mapped in GPTW_QUESTIONS dimensions. Use question IDs from the question text pattern. Exact question groupings for Innovation and Leadership are a discretion area — see Open Questions below.

### Anonymity Threshold Enforcement

```typescript
function computeSegmentBreakdown(
  rows: Record<string, string>[],
  demographicField: string,  // e.g. 'DEM-ORG'
  threshold = 5
): DepartmentBreakdownData {
  const groups = groupBy(rows, r => r[demographicField] || 'Unknown');
  return {
    segments: Object.entries(groups).map(([label, groupRows]) => ({
      segmentLabel: label,
      responseCount: groupRows.length,
      dimensions: groupRows.length < threshold
        ? DIMENSION_ORDER.map(d => ({ dimension: d, score: null }))  // null = insufficient data
        : DIMENSION_ORDER.map(d => ({ dimension: d, score: computeDimScore(groupRows, d) }))
    })),
    anonymityThreshold: threshold,
  };
}
```

### SurveySelector Component

```typescript
// src/components/dashboard/SurveySelector.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SurveySelectorProps {
  surveys: { id: string; name: string }[];
  activeSurveyId: string | undefined;
}
```

Uses shadcn/ui `Select` (already installed). On value change, calls `router.push(`/en/admin?survey=${id}`)` or uses `usePathname()` for locale-aware routing.

**Locale-aware URL construction:** Must include current locale in the redirect. Use `usePathname()` to get current path prefix.

### Empty State Pattern

When `analyticsData === null` (zero responses), render a simple centered message:

```tsx
<div className="flex flex-col items-center justify-center py-24 text-center">
  <p className="text-lg font-light text-gray-900">No responses yet</p>
  <p className="text-sm text-gray-400 mt-2">
    Send survey invitations and responses will appear here.
  </p>
</div>
```

Keep the survey selector visible even in empty state so admin can switch surveys.

### File Locations

```
src/
├── lib/services/
│   └── analytics.service.ts     (NEW — core computation)
├── components/dashboard/
│   ├── DashboardCharts.tsx      (MODIFY — add departmentBreakdown field + DepartmentBreakdownChart)
│   ├── SurveySelector.tsx       (NEW)
│   └── DepartmentBreakdownChart.tsx  (NEW)
└── app/[locale]/(admin)/admin/
    └── page.tsx                 (MODIFY — replace demoData with analytics.service call)
```

### Anti-Patterns to Avoid

- **Modifying chart components** (DimensionBarChart, ENPSGauge, etc.): These are locked. Wire data to them, do not edit them.
- **Client-side CSV reading**: CSV reads happen only in server components / server-only services. Never import csv.service.ts in a client component.
- **Index-based CSV column access**: All CSV reads use column names (FOUN-03). `answers[questionId]` not `answers[3]`.
- **Promise.all for heavy computation**: Analytics is read-heavy but single-file. One `readRows` call, compute everything in memory, return.
- **Modifying the DashboardData interface without updating analytics.service.ts**: The interface and the service must stay in sync.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | Custom string split | `readRows()` from csv.service.ts | Already handles header-keyed parsing, ETag retry, Blob fallback |
| Chart rendering | Custom SVG charts | Existing recharts components | All chart components are complete; zero chart code needed |
| UI Select for survey picker | Custom dropdown | shadcn/ui `Select` | Already installed and used throughout admin UI |
| Grouped bar chart | Manual recharts setup from scratch | Recharts `BarChart` with `groupMode="grouped"` | Recharts handles grouped bars natively |
| Token count (response rate denominator) | Count from responses CSV only | Read tokens CSV via `readRows('tokens-{id}.csv')` | Tokens CSV has all issued tokens regardless of submission status |

**Key insight:** This phase is almost entirely computation logic, not UI building. Every chart, animation, and layout primitive exists. The only UI work is SurveySelector and DepartmentBreakdownChart.

---

## Common Pitfalls

### Pitfall 1: Division by Zero on Empty Questions
**What goes wrong:** Some questions may have zero valid answers (employee skipped a section). `count / 0 = NaN` propagates through averages and produces `NaN%` in charts.
**Why it happens:** CSV row has empty string `""` for optional questions.
**How to avoid:** Filter out empty-string answers before computing per-question scores. If `validAnswers.length === 0`, return `null` or skip from aggregate.
**Warning signs:** Charts show `NaN%` or `0%` on statements that were genuinely skipped.

### Pitfall 2: String-to-Number Likert Parsing
**What goes wrong:** CSV stores all values as strings (`"4"`, `"5"`). Equality check `answer === 4` (number) always returns false.
**Why it happens:** `dynamicTyping: false` in papaparse config (intentional — FOUN-03).
**How to avoid:** Always compare `answer === "4"` or `parseInt(answer, 10) >= 4`. Never coerce with `==`.

### Pitfall 3: ENPS Score Range Confusion
**What goes wrong:** ENPS score is `promoters% - detractors%` which can be negative. Rendering as `84%` when the real value is `-32` corrupts the metric.
**Why it happens:** Treating ENPS score the same as a percentage.
**How to avoid:** The `enps.score` field is a signed integer (-100 to +100). LeaderboardGrid renders it as `{value}%` — for ENPS that is intentional by convention but technically ENPS is not a percentage. The leaderboard demo data shows `84` for ENPS — this is the score treated as if percentage for display purposes. Keep consistent with demo data.

### Pitfall 4: SurveySelector Locale-Unaware URL Push
**What goes wrong:** `router.push('/admin?survey=X')` drops the locale prefix, causing next-intl to redirect to `/en/admin` and lose the survey param.
**Why it happens:** Hardcoded path ignores current locale.
**How to avoid:** Use `usePathname()` to extract current path or construct URL as `/${locale}/admin?survey=${id}`. The admin layout is under `/[locale]/(admin)/admin/`.
**Warning signs:** Survey changes cause locale to reset to default.

### Pitfall 5: searchParams Must Be Awaited in Next.js 15+
**What goes wrong:** `const { survey } = searchParams` throws because searchParams is a Promise in Next.js 15.
**Why it happens:** Breaking change in Next.js 15 — both `params` and `searchParams` are now Promises.
**How to avoid:** `const { survey } = await searchParams;` in the page component. This pattern is already used in `submit/route.ts` for `params`.

### Pitfall 6: DashboardData Interface Not Exported
**What goes wrong:** `analytics.service.ts` cannot import `DashboardData` type because it's not exported from `DashboardCharts.tsx`.
**Why it happens:** Interface is private to the component file.
**How to avoid:** Export `DashboardData` from `DashboardCharts.tsx` OR define it in a separate `src/lib/types/analytics.ts` file and import in both places.

### Pitfall 7: Token Count for Response Rate
**What goes wrong:** Using `rows.length` from responses CSV as both numerator AND denominator gives 100% response rate always.
**Why it happens:** Forgetting that response rate = submitted / invited.
**How to avoid:** Read `tokens-{surveyId}.csv` to count total issued tokens. `token.service.ts` already has `readRows` calls — add a `countTokens(surveyId)` helper or inline in analytics.service.

---

## Code Examples

### Per-Question Favorable Score
```typescript
// Source: derived from GPTW_QUESTIONS structure in lib/constants.ts + csv schema
function favorableScore(rows: Record<string, string>[], questionId: string): number {
  const validAnswers = rows
    .map(r => r[questionId])
    .filter(v => v && v !== '');
  if (validAnswers.length === 0) return 0;
  const favorable = validAnswers.filter(v => v === '4' || v === '5').length;
  return Math.round((favorable / validAnswers.length) * 100);
}
```

### Dimension Score Computation
```typescript
// Source: GPTW_QUESTIONS dimension mapping in lib/constants.ts
function dimensionScore(
  rows: Record<string, string>[],
  dimension: string,
  questions: { id: string; dimension?: string }[]
): number {
  const questionIds = questions
    .filter(q => q.dimension === dimension && q.type === 'likert')
    .map(q => q.id);
  if (questionIds.length === 0) return 0;
  const scores = questionIds.map(id => favorableScore(rows, id));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
```

### ENPS Computation (UNC-47)
```typescript
// Source: CONTEXT.md specifics — UNC-47 is the "great place to work" question
function computeENPS(rows: Record<string, string>[]): { score: number; promoters: number; passives: number; detractors: number } {
  const answers = rows.map(r => r['UNC-47']).filter(v => v && v !== '');
  const total = answers.length;
  if (total === 0) return { score: 0, promoters: 0, passives: 0, detractors: 0 };
  const promoters = Math.round(answers.filter(v => v === '4' || v === '5').length / total * 100);
  const passives = Math.round(answers.filter(v => v === '3').length / total * 100);
  const detractors = Math.round(answers.filter(v => v === '1' || v === '2').length / total * 100);
  return { score: promoters - detractors, promoters, passives, detractors };
}
```

### SurveySelector URL Push (Locale-Safe)
```typescript
// Source: next-intl routing pattern established in Phase 1
'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

function SurveySelector({ surveys, activeSurveyId }: SurveySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();  // e.g. "/en/admin"
  const searchParams = useSearchParams();

  function handleChange(surveyId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('survey', surveyId);
    router.push(`${pathname}?${params.toString()}`);
  }
  // ...
}
```

### DepartmentBreakdownChart Props
```typescript
// New component — grouped bar chart using recharts BarChart
interface DepartmentBreakdownChartProps {
  data: {
    dimension: string;
    [segmentLabel: string]: number | string | null;  // score per segment, null = hidden
  }[];
  segments: string[];   // segment labels for bar rendering
  threshold: number;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Chart.js (DASH-09 requirement text) | recharts via shadcn/ui (already migrated) | DASH-09 requirement text mentions Chart.js but codebase already uses recharts — ignore DASH-09's "Chart.js" mention |
| `searchParams` as sync object | `searchParams` as Promise (Next.js 15+) | Must `await searchParams` in page component |
| `params` as sync object | `params` as Promise (Next.js 15+) | Already handled in submit/route.ts — same pattern for page.tsx |
| Middleware.ts | proxy.ts (Next.js 16 deprecation) | Noted in STATE.md — no action needed for Phase 4 |

**Note on DASH-09:** The requirement says "use Chart.js with dynamic import ssr:false." The codebase has already migrated to recharts (noted in CONTEXT.md: "all chart components use shadcn/ui charts (Recharts) — already migrated from chart.js"). LazyChart.tsx exists for lazy instantiation (DASH-10). DASH-09 is satisfied by the existing architecture.

---

## Open Questions

1. **Innovation and Leadership leaderboard sub-scores**
   - What we know: Leaderboard has 11 items including "Innovation" and "Leadership" — shown in demo data
   - What's unclear: No explicit Innovation/Leadership dimension in GPTW_QUESTIONS. Questions like CRE-11 (try new things), RES-38 (share ideas), RES-44 (new approaches) are innovation-adjacent; CRE-09/10/13/15 are leadership-adjacent
   - Recommendation: Planner discretion — define the question groupings in analytics.service.ts with a clear comment. Suggested: Innovation = {CRE-11, RES-38, RES-44, PRI-28}, Leadership = {CRE-09, CRE-10, CRE-12, CRE-13, CRE-15}

2. **eesTrend field**
   - What we know: DashboardData has `eesTrend: number` — shown as "+/-X% vs last year" trend arrow
   - What's unclear: No multi-survey comparison logic in v1
   - Recommendation: Hardcode `eesTrend: 0` — MetricCard only renders the trend component when trend.value != 0 would be ideal, but currently it always renders. Either hardcode 0 (no arrow shown would be ideal) or pass 0 and accept the "0% vs last year" display.

3. **Response rate denominator (tokens CSV)**
   - What we know: `token.service.ts` manages `tokens-{surveyId}.csv`. There's no existing `countTokens(surveyId)` function.
   - What's unclear: The tokens CSV may have multiple rows per email (idempotent generation — same email+survey returns same token). Need to count distinct tokens, not rows.
   - Recommendation: Add `countSurveyTokens(surveyId: string): Promise<number>` to token.service.ts; count all rows regardless of status. The submit route already reads this file.

4. **DashboardData type export**
   - What we know: The interface is defined inline inside DashboardCharts.tsx (not exported)
   - Recommendation: Export it and co-locate in a new `src/lib/types/analytics.ts` so analytics.service.ts can import it without a circular dependency

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected in codebase |
| Config file | None — Wave 0 gap |
| Quick run command | `pnpm test` (once configured) |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | EES = mean % favorable across all Likert | unit | `pnpm test -- analytics.service` | Wave 0 |
| DASH-04 | ENPS from UNC-47: promoters - detractors | unit | `pnpm test -- analytics.service` | Wave 0 |
| DATA-04 | Segments < 5 return null scores | unit | `pnpm test -- analytics.service` | Wave 0 |
| DASH-12 | Survey selector updates URL searchParam | manual | Browser test | N/A |
| DASH-11 | Analytics computed server-side | smoke | Page renders without client errors | Manual |

### Wave 0 Gaps
- [ ] `src/lib/services/__tests__/analytics.service.test.ts` — covers DASH-01, DASH-04, DATA-04
- [ ] Test framework install (vitest or jest) — none currently present in repo

*(Note: Given no test infrastructure exists and this is a computation-heavy service, the planner should consider whether a Wave 0 test setup task is worth the overhead or if the analytics formulas should be validated manually with a known CSV dataset.)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reads — `DashboardCharts.tsx`, `constants.ts`, `csv.service.ts`, `survey.service.ts`, `types.ts`, `submit/route.ts` — all findings are based on current code
- `04-CONTEXT.md` — locked decisions and formulas
- `UX-DESIGN-SPEC.md` Section 9 — dashboard layout hierarchy

### Secondary (MEDIUM confidence)
- Next.js 15 `searchParams` Promise pattern — confirmed by existing `params` usage in `submit/route.ts` which already uses `await params`
- ENPS formula (promoters - detractors as signed integer) — standard GPTW methodology, confirmed by CONTEXT.md

### Tertiary (LOW confidence)
- Innovation/Leadership leaderboard question groupings — inferred from question text, not explicitly mapped in constants.ts

---

## Metadata

**Confidence breakdown:**
- Analytics formulas: HIGH — derived directly from CSV schema and locked decisions in CONTEXT.md
- DashboardData interface: HIGH — read directly from DashboardCharts.tsx
- CSV response schema: HIGH — read directly from submit/route.ts column construction
- Department breakdown component: HIGH — UX spec Section 9.7 is explicit
- Innovation/Leadership sub-scores: LOW — question grouping not specified, requires planner discretion
- Response rate denominator: MEDIUM — tokens CSV exists but countTokens function needs to be added

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable codebase, no fast-moving dependencies)
