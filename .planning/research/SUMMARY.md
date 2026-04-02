# Project Research Summary

**Project:** Culture Survey — Bilingual Employee Culture Survey Platform
**Domain:** Employee culture survey and analytics platform (Next.js, CSV storage, SMTP, Chart.js, i18n)
**Researched:** 2026-04-01
**Confidence:** HIGH (stack, architecture, pitfalls), MEDIUM-HIGH (feature classification)

## Executive Summary

Culture Survey is a purpose-built Great Place to Work Trust Index survey platform serving Burmese-speaking corporate employees at Yoma Bank and Wave Money. Unlike generic survey tools (Google Forms, SurveyMonkey), it ships with the GPTW dimension model pre-wired (Credibility, Respect, Fairness, Pride, Camaraderie), bilingual English/Burmese rendering from day one, and a full analytics dashboard that turns raw Likert responses into actionable HR insights. The entire stack is deliberate: Next.js 15 App Router for server/client separation, Chart.js 4 via react-chartjs-2 for 20+ chart types, Vercel Blob for CSV persistence, next-intl for SSR-safe i18n, and iron-session for single-admin auth without database overhead.

The recommended build approach follows a strict dependency order driven by the architecture: foundation (data model, storage abstraction, auth, i18n routing) must be fully established before any application features are built. The CSV read-mutate-write pattern is central to every data operation and must be implemented with Vercel Blob ETag-based concurrency control from the start — not retrofitted. The survey form and email distribution are Phase 2 scope; the analytics dashboard is Phase 3. This order is non-negotiable because survey data must exist before any chart has meaning.

The highest-risk dimension of this project is Myanmar language handling. The Zawgyi-vs-Unicode encoding split affects a significant share of the target user base on older Android devices. If Unicode is assumed and Zawgyi detection is skipped, survey questions will appear as garbled characters for Wave Money field staff. The second-highest risk is concurrent CSV write collisions on Vercel Blob — silent data loss that only manifests during real survey drives. Both risks must be addressed in Phase 1 foundations, not treated as later hardening steps.

## Key Findings

### Recommended Stack

The stack is fully specified and version-pinned. Next.js 15.2.4 with React 19 and TypeScript 5 is the base; all application code lives in the App Router. Chart.js 4.5.1 with react-chartjs-2 5.3.1 is the exclusive charting layer — every chart component must carry `'use client'` and use `dynamic()` with `ssr: false`. next-intl 4.8.3 handles bilingual routing via URL-based locale paths (`/en/...` vs `/my/...`) to avoid SSR hydration mismatches. iron-session 8.x provides cookie-based admin sessions with no database dependency. Vercel Blob with papaparse handles all CSV persistence.

**Core technologies:**
- **Next.js 15.2.4 (App Router):** Full-stack framework — server components fetch data, client components render charts; Vercel-native deployment
- **Chart.js 4.5.1 + react-chartjs-2 5.3.1:** All chart types (bar, donut, gauge, radar, grouped bar) — react-chartjs-2 handles canvas lifecycle in React
- **next-intl 4.8.3:** SSR-safe bilingual i18n — URL-path locale strategy prevents hydration mismatch
- **Tailwind CSS 4 + shadcn/ui:** Utility styling with accessible component primitives for admin UI
- **Vercel Blob + papaparse:** CSV persistence layer — Blob provides production storage, papaparse handles serialization
- **iron-session 8:** Encrypted cookie sessions for single admin — three lines to protect a route, no database required
- **Nodemailer 8:** SMTP email dispatch — server-side only, admin-configured credentials
- **react-hook-form 7.60 + zod 3.25:** Survey form state (46 questions, `onBlur` mode to prevent per-keystroke re-renders) + schema validation
- **Noto Sans Myanmar Variable (Fontsource):** Self-hosted Unicode Myanmar font — required for correct OpenType shaping

**Critical version requirements:** next-intl 4.x is App Router only (dropped Pages Router). iron-session 8.x is required for App Router (v6/v7 are Pages Router only). Do NOT use the `xlsx` npm package (unpatched CVEs) — use `exceljs` for Excel parsing. Do NOT use `next-i18next` (Pages Router only). Do NOT use `framer-motion` — the canonical package is now `motion`.

### Expected Features

The feature set is well-defined by the GPTW Trust Index model and the competitive landscape of Culture Amp and Officevibe.

**Must have (table stakes) — v1 launch:**
- Admin authentication — gates all admin functionality
- Survey creation with bilingual Excel import — loads 46 GPTW statements
- Unique link generation + SMTP email distribution — one URL per employee
- Employee survey form: multi-section Likert + open-ended + demographic questions, bilingual
- Response collection to CSV per survey
- GPTW dimension scoring (5 dimensions as % favorable) — the core analytical output
- Analytics dashboard: 5 dimension bar charts + ENPS gauge + Top 10/Bottom 10 statement rankings
- Department/demographic breakdown charts — required from survey day one (cannot be added retroactively)
- Leaderboard metrics view — scannable executive summary
- Response rate tracking
- i18n English + Burmese — non-negotiable for employee participation

**Should have (differentiators) — v1.x after validation:**
- Deep-dive sub-pillar charts per dimension (Credibility → Communication/Competence/Integrity)
- Key relationship analysis (Engagement, Innovation, Leadership Behavior)
- Radar/spider dimension overview chart
- Gap analysis: Manager vs Individual Contributor
- Animated chart transitions (Motion library)
- Sentiment word cloud on open-ended responses

**Defer (v2+):**
- Year-over-year benchmark comparison (requires two complete survey cycles)
- Internal/external benchmark trend lines
- AI-generated focus areas or action plans

**Anti-features (explicitly excluded):** Real-time analytics during collection (anchoring bias risk), individual response identification (destroys psychological safety), multi-tenant isolation, recurring/automated surveys, database backend.

### Architecture Approach

The architecture follows a clean server-fetches/client-renders split enforced by Next.js App Router route groups: `(admin)/` for auth-gated pages and `(public)/` for token-gated survey forms. A services layer (`lib/services/`) isolates all CSV I/O, email, token management, and analytics aggregation from thin API route handlers. The storage layer abstracts behind a `StorageAdapter` interface (`LocalAdapter` for dev, `BlobAdapter` for production) so all business logic is testable without Vercel infrastructure. All chart components are `'use client'`, receive pre-aggregated data as props from server component pages — no client-side data fetching.

**Major components:**
1. **`middleware.ts`** — JWT auth check on `/admin/*`; token existence check on `/survey/[token]`; must use `jose` (edge-compatible), not Node.js `crypto`
2. **`lib/services/csv.service.ts`** — read-mutate-write CSV via Vercel Blob (ETag concurrency) or local `fs` (dev); StorageAdapter pattern
3. **`lib/services/analytics.service.ts`** — aggregates raw responses into dimension scores, ENPS, and statement rankings; runs server-side in a single pass
4. **`lib/services/token.service.ts`** — generates `crypto.randomBytes(32)` tokens, validates, marks used; stored in `tokens-{surveyId}.csv`
5. **`lib/services/email.service.ts`** — Nodemailer transporter from admin-configured SMTP; test-send for onboarding validation
6. **`components/charts/*`** — all `'use client'`; Chart.js wrappers with proper `useEffect` cleanup and `dynamic()` + `ssr: false`
7. **`messages/en.json` + `messages/mm.json`** — next-intl translation files; locale driven by URL path

**Build order from architecture:** types/constants → csv.service (StorageAdapter) → auth + middleware → token.service → survey CRUD → email service → survey form + i18n → response ingestion → analytics.service → chart components + dashboard.

### Critical Pitfalls

1. **Vercel read-only filesystem** — `fs.writeFile()` silently fails or throws `EROFS` in production; use `@vercel/blob` as the primary write layer from day one; abstract behind `StorageAdapter` so local dev still uses `fs`. Never defer this to production hardening.

2. **Concurrent CSV write race condition** — two simultaneous survey submissions both read the same blob, both write back, second overwrites first; use Vercel Blob ETag-based conditional writes (`ifMatch`) with retry loop catching `BlobPreconditionFailedError`; implement in `csv.service.ts` before building any submission endpoint.

3. **Zawgyi vs. Unicode encoding** — Myanmar users on older Android devices use Zawgyi encoding (same code point range as Unicode); text appears garbled across the encoding boundary; store internally as Unicode, detect Zawgyi rendering environment with `myanmar-tools` library, test on real Android hardware with Myanmar locale; this is non-negotiable for Wave Money field staff.

4. **Chart.js canvas memory leaks** — 20+ Chart.js instances on the dashboard; React re-renders without `useEffect` cleanup leak canvas instances; always use `react-chartjs-2` (handles lifecycle), return cleanup that calls `.destroy()`, use IntersectionObserver for lazy instantiation, disable animations on initial load; establish this pattern before building the first chart.

5. **i18n hydration mismatch** — SSR renders English, client hydrates to Burmese causing React hydration error or visible flash; use URL-path locale routing (`/en/...` vs `/my/...`) not browser detection; `next-intl` with `i18n/request.ts` is the only safe configuration for App Router; changing this after routes are built requires a rewrite.

6. **Weak/replayable survey tokens** — `Math.random()` tokens are guessable; tokens never marked used allow forwarded link re-submission; always use `crypto.randomBytes(32).toString('hex')`; mark `submitted` server-side atomically before writing response; reject used tokens with 410 Gone.

7. **SMTP silent failure** — SMTP errors swallowed and reported as success; build "Send Test Email" button into the SMTP config modal that surfaces raw error messages; default to port 587 STARTTLS (not 465 SSL); document Gmail App Password requirement.

8. **CSV schema drift** — adding/reordering questions after responses are collected breaks column mapping; always write and read by header name (not index); include `questionId` column in response CSV; define schema with explicit IDs in `lib/constants.ts` before writing any CSV code.

## Implications for Roadmap

The dependency graph from FEATURES.md and the build order from ARCHITECTURE.md converge on a 4-phase structure. The ordering is strict: each phase gates the next.

### Phase 1: Foundation and Storage

**Rationale:** Every feature in the system reads or writes CSV via Vercel Blob. Auth gates all admin pages. i18n routing determines URL structure. CSV schema defines what every downstream component expects. None of this can be retrofitted — it must come first. Three of the nine critical pitfalls (Vercel filesystem, concurrent writes, i18n hydration, CSV schema drift) are Phase 1 concerns.

**Delivers:** Working data layer, auth-gated admin shell, bilingual routing, deployable skeleton on Vercel
**Addresses (features):** Admin authentication, basic admin shell, i18n infrastructure
**Avoids:** Pitfall 1 (Vercel filesystem), Pitfall 2 (concurrent writes), Pitfall 5 (i18n hydration), Pitfall 8 (CSV schema drift), Pitfall 3 (Zawgyi encoding declaration)

**Key outputs:**
- `lib/types.ts` — shared TypeScript interfaces
- `lib/constants.ts` — GPTW dimension mappings and question IDs
- `lib/services/csv.service.ts` — StorageAdapter with ETag retry logic
- `lib/auth.ts` + `middleware.ts` + `/api/auth` + `/login`
- `i18n/request.ts` + URL-based locale routing (`/[locale]/...`)
- `messages/en.json` + `messages/mm.json` stubs
- Verified Vercel Blob read/write in deployed preview environment

### Phase 2: Survey Creation, Email Distribution, and Survey Form

**Rationale:** Survey management and email distribution are tightly coupled (you can't send links without surveys; you can't track responses without tokens). The employee survey form is the primary data collection surface — it must be fully bilingual and validated before launch. Token security must ship with link generation, not separately.

**Delivers:** Full survey-to-submission pipeline — admin creates survey, sends invitations, employees complete bilingual form
**Addresses (features):** Survey creation + Excel import, employee email list management, token generation, SMTP config modal with test send, survey invitation email, employee survey form (multi-section, bilingual), form validation, completion confirmation, response collection to CSV, response rate tracking
**Avoids:** Pitfall 6 (weak tokens — generate and invalidate together), Pitfall 7 (SMTP silent failure — test send is mandatory), Myanmar encoding on survey questions and form error messages
**Uses:** next-intl, Nodemailer, react-hook-form + zod, papaparse, token.service, email.service, exceljs (Excel import)

### Phase 3: Analytics Dashboard and Reporting

**Rationale:** The dashboard is the primary deliverable for HR users — it turns raw CSV into insight. It depends entirely on Phase 2 (responses must exist). This phase has the highest implementation complexity (20+ chart types, GPTW scoring model, demographic segmentation). The chart lifecycle pattern must be established before building individual chart types.

**Delivers:** Full analytics dashboard — GPTW dimension scores, ENPS, Top 10/Bottom 10, department breakdowns, leaderboard
**Addresses (features):** GPTW dimension scoring (5 dimensions as % favorable), analytics dashboard with Chart.js visualizations, ENPS gauge, Top 10/Bottom 10 statement rankings, department/demographic breakdowns, leaderboard metrics
**Avoids:** Pitfall 4 (Chart.js memory leaks — establish cleanup pattern first), dashboard render performance (lazy mount + pre-compute aggregates server-side)
**Uses:** Chart.js, react-chartjs-2, analytics.service, IntersectionObserver lazy loading, `dynamic()` with `ssr: false`, shadcn/ui dashboard components

### Phase 4: Polish and v1.x Differentiators

**Rationale:** Once the core survey-to-insight pipeline is validated with real data, add the differentiating features that elevate Culture Survey above generic survey tools. These are all enhancements, not blockers — they can be built and deployed independently.

**Delivers:** Enhanced analytics depth, animated dashboards, executive-facing visualizations
**Addresses (features):** Deep-dive sub-pillar charts, radar/spider dimension chart, key relationship analysis (Employee/Job/Management), gap analysis (Manager vs IC), animated chart transitions, sentiment word cloud on open-ended responses
**Avoids:** Animation performance regressions — use `motion` library only where CSS cannot suffice; word cloud is client-side word frequency, not NLP

### Phase Ordering Rationale

- **Foundation before features:** The CSV schema, StorageAdapter, auth, and i18n routing are non-retroactive decisions. Building any feature before these are stable creates rework debt.
- **Survey pipeline before analytics:** Analytics has no data to visualize until the survey form and response collection work end-to-end. Both must be validated on Vercel (not just localhost) before Phase 3 begins.
- **Survey creation and email distribution together in Phase 2:** Token generation and token invalidation must ship in the same release — generating tokens without the used-check is a security hole that should never go to production even briefly.
- **Charts as a block in Phase 3:** The chart lifecycle pattern (cleanup, lazy mount, server-side aggregation) must be established as a template before 20+ chart types are built individually. Building chart by chart without the pattern means retrofitting cleanup across all of them.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Myanmar Zawgyi/Unicode detection in practice — `myanmar-tools` integration specifics and testing methodology on Android; the research identifies the problem but implementation details warrant a focused phase research pass
- **Phase 3:** Chart.js performance optimization for 20+ simultaneous instances — IntersectionObserver lazy mount pattern with react-chartjs-2 is documented but the dashboard-scale implementation may need specific configuration research
- **Phase 3:** GPTW dimension-to-question mapping and sub-pillar structure — this requires the actual 46-question manifest to verify the scoring model implementation

Phases with standard patterns (skip research-phase):
- **Phase 1:** Next.js App Router project setup, iron-session auth, next-intl URL routing — all well-documented with official guides and high-confidence sources
- **Phase 1:** Vercel Blob ETag pattern — documented in official Vercel Blob SDK docs with code examples
- **Phase 2:** Nodemailer SMTP with test-send — standard pattern with high-confidence official docs
- **Phase 4:** Motion animations — standard usage; defer until Phase 3 is validated

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core packages (Next.js, Chart.js, next-intl, iron-session, Vercel Blob) verified via official npm and docs. One MEDIUM item: Next.js 15.2.4 version confirmed via corroborated blog + GitHub, not official release page. |
| Features | HIGH (table stakes), MEDIUM (differentiator classification) | GPTW Trust Index dimensions are authoritative. Differentiator vs. table-stakes classification is based on competitive analysis — reasonable but not validated against actual Yoma Bank/Wave Money HR user expectations. |
| Architecture | HIGH | Official Next.js App Router docs, Vercel Blob SDK, and next-intl docs are primary sources. CVE-2025-29927 middleware bypass informs the jose JWT approach — verified via official security disclosure. |
| Pitfalls | MEDIUM-HIGH | Core pitfalls (Vercel filesystem, CSV concurrency, Chart.js lifecycle) verified via official GitHub issues and docs. Zawgyi/Unicode risk verified via Meta engineering blog and Unicode.org. SMTP pitfalls from Nodemailer official docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Zawgyi detection implementation depth:** Research identifies `myanmar-tools` as the solution but does not provide a tested integration example for Next.js App Router client components. Validate during Phase 2 survey form implementation with real Android test devices.
- **GPTW question-to-dimension mapping:** The 46-question manifest and its sub-pillar assignments must be sourced from the actual project question list (likely in the PDF/Excel). `lib/constants.ts` cannot be finalized without this data. Confirm with project owner before starting Phase 3.
- **Concurrent write behavior at Yoma Bank scale:** Vercel Blob ETag retry is the recommended mitigation for concurrent submissions. At Yoma Bank + Wave Money combined employee count, if a single survey drive pushes hundreds of simultaneous submissions, additional queuing may be needed. Monitor during Phase 2 load testing.
- **SMTP environment variability:** The test-send button is the mitigation for SMTP configuration failures, but the specific SMTP settings for Yoma Bank and Wave Money corporate mail servers are unknown. Build the error surface to expose raw SMTP error codes so IT admins can self-diagnose.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router docs](https://nextjs.org/docs/app) — project structure, server/client components, authentication patterns
- [next-intl 4.0 official release notes](https://next-intl.dev/blog/next-intl-4-0) — App Router-only, URL locale routing
- [Vercel Blob SDK docs](https://vercel.com/docs/vercel-blob/using-blob-sdk) — ETag conditional writes, BlobPreconditionFailedError
- [Chart.js official performance guide](https://www.chartjs.org/docs/latest/general/performance.html) — lazy loading, animation tradeoffs
- [iron-session v8 GitHub release](https://github.com/vvo/iron-session/releases/tag/v8.0.0) — App Router support
- [Nodemailer SMTP docs](https://nodemailer.com/smtp) — transport config, error reference
- [shadcn/ui changelog March 2026](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — cli v4 compatibility
- [Fontsource Noto Sans Myanmar](https://fontsource.org/fonts/noto-sans-myanmar) — self-hosted Myanmar font
- [Facebook/Meta myanmar-tools](https://engineering.fb.com/2019/09/26/android/unicode-font-converter/) — Zawgyi detection
- [CVE-2025-29927 Next.js middleware bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — jose JWT requirement

### Secondary (MEDIUM confidence)
- [Great Place to Work Trust Model](https://greatplacetowork.me/trust-model/) — GPTW 5-dimension structure: Credibility, Respect, Fairness, Pride, Camaraderie
- [Myanmar encoding Zawgyi vs Unicode](https://www.globalapptesting.com/blog/zawgyi-vs-unicode) — encoding split in Myanmar market
- [react-chartjs-2 canvas already in use issue](https://github.com/reactchartjs/react-chartjs-2/issues/1037) — chart lifecycle cleanup requirement
- [next-i18next hydration error](https://github.com/i18next/next-i18next/issues/2258) — confirms Pages Router i18n libraries cause hydration issues
- [Culture Amp platform overview](https://www.cultureamp.com/platform) — competitive feature baseline
- [Top Employee Survey Tools 2026](https://peoplemanagingpeople.com/tools/best-employee-survey-tools/) — competitive landscape

### Tertiary (LOW confidence)
- [Next.js 15.2.4 March 2026 version](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new) — version confirmed but primary source is a blog; treat as accurate until official release notes contradict
- [react-hook-form 7.60 + zod 3.25 compatibility](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) — community article corroborated by npm versions

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
