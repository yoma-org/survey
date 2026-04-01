# Architecture Research

**Domain:** Employee culture survey platform (Next.js, CSV storage, SMTP email, i18n)
**Researched:** 2026-04-01
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├──────────────────────────┬──────────────────────────────────────┤
│    Admin Space           │          Public Survey Space          │
│  (auth-gated pages)      │      (token-gated, no auth)           │
│                          │                                       │
│  ┌────────────────┐      │   ┌─────────────────────────────┐    │
│  │ Admin Dashboard│      │   │  Survey Form                │    │
│  │ (Chart.js UI)  │      │   │  /survey/[token]            │    │
│  │ 'use client'   │      │   │  'use client' form parts    │    │
│  └───────┬────────┘      │   └──────────────┬──────────────┘    │
│          │               │                  │                    │
│  ┌───────┴────────┐      │   ┌──────────────┴──────────────┐    │
│  │ Survey Mgmt    │      │   │  Confirmation / Thank You   │    │
│  │ Email Dispatch │      │   └─────────────────────────────┘    │
│  └───────┬────────┘      │                                       │
└──────────┼───────────────┴──────────────────────────────────────┘
           │
┌──────────┴───────────────────────────────────────────────────────┐
│                     Next.js App Router (Server)                   │
├──────────────────────────────────────────────────────────────────┤
│  middleware.ts  ─── auth check for /admin/* routes               │
│                 ─── token validation for /survey/[token] routes  │
├──────────────────────────────────────────────────────────────────┤
│  API Route Handlers  (app/api/*)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ /api/surveys │  │ /api/email   │  │ /api/responses         │  │
│  │ CRUD + token │  │ SMTP send    │  │ submit + read          │  │
│  │ generation   │  │ via nodemailer│  │ append CSV             │  │
│  └──────────────┘  └──────────────┘  └────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │ /api/auth    │  │ /api/export  │                               │
│  │ session mgmt │  │ CSV download │                               │
│  └──────────────┘  └──────────────┘                               │
├──────────────────────────────────────────────────────────────────┤
│  Services Layer  (lib/services/*)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ csv.service  │  │ email.service│  │ token.service          │  │
│  │ read/write/  │  │ nodemailer   │  │ generate + validate    │  │
│  │ append logic │  │ transporter  │  │ survey access tokens   │  │
│  └──────────────┘  └──────────────┘  └────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │ analytics.   │  │ i18n request │                               │
│  │ service      │  │ (next-intl)  │                               │
│  │ aggregation  │  │              │                               │
│  └──────────────┘  └──────────────┘                               │
├──────────────────────────────────────────────────────────────────┤
│                       Storage Layer                               │
│  ┌───────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Local /data/*.csv     │  │ Vercel Blob (production sync)   │  │
│  │ surveys.csv           │  │ Object: read full → mutate →    │  │
│  │ responses.csv         │  │ write back (no append API)      │  │
│  │ tokens.csv            │  │                                 │  │
│  │ smtp-config.json      │  └─────────────────────────────────┘  │
│  └───────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Admin pages (`/admin/*`) | Survey creation, employee email input, results dashboard | API routes via fetch/Server Actions |
| Survey form (`/survey/[token]`) | Bilingual form display, response capture | `/api/responses` on submit |
| `middleware.ts` | Auth check for `/admin/*`; token existence check for `/survey/[token]` | Next.js routing layer |
| `/api/surveys` | CRUD for survey definitions, token generation per email | `csv.service`, `token.service` |
| `/api/email` | Bulk SMTP dispatch with unique survey links | `email.service` (nodemailer) |
| `/api/responses` | Accept submitted survey, validate token, write response to CSV | `csv.service`, `token.service` |
| `/api/auth` | Session cookie issue/verify for admin static credentials | `lib/auth.ts` |
| `/api/export` | Stream full CSV download to admin | `csv.service` |
| `csv.service` | Read, write, and update CSV files locally or via Vercel Blob | Storage layer |
| `email.service` | Create nodemailer transporter from stored SMTP config, send | SMTP server (external) |
| `token.service` | Generate UUID/crypto tokens, map to `{surveyId, email, used}` | `csv.service` (tokens.csv) |
| `analytics.service` | Aggregate raw responses into dimension scores, ENPS, rankings | `csv.service` |
| Chart components (`/components/charts/*`) | Render Chart.js visualizations — all `'use client'` | Props from server parent |
| i18n (`next-intl`) | Route locale detection, message lookup for EN/MM | `messages/en.json`, `messages/mm.json` |

## Recommended Project Structure

```
src/
├── app/
│   ├── (admin)/                  # Route group — auth-gated
│   │   ├── layout.tsx            # Admin shell with nav/sidebar
│   │   ├── admin/
│   │   │   ├── page.tsx          # Dashboard (server — fetches data, passes to charts)
│   │   │   ├── surveys/
│   │   │   │   ├── page.tsx      # Survey list + create
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Survey detail + email dispatch
│   │   │   ├── results/
│   │   │   │   └── [surveyId]/
│   │   │   │       └── page.tsx  # Analytics for one survey
│   │   │   └── settings/
│   │   │       └── page.tsx      # SMTP config
│   ├── (public)/                 # Route group — no auth
│   │   ├── layout.tsx            # Minimal public shell
│   │   ├── survey/
│   │   │   └── [token]/
│   │   │       └── page.tsx      # Survey form (server validates token, renders form)
│   │   └── thank-you/
│   │       └── page.tsx          # Post-submission confirmation
│   ├── login/
│   │   └── page.tsx              # Admin login form
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts          # POST login, DELETE logout
│   │   ├── surveys/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE survey
│   │   ├── responses/
│   │   │   └── route.ts          # POST submit response
│   │   ├── email/
│   │   │   └── route.ts          # POST send survey emails
│   │   └── export/
│   │       └── route.ts          # GET download responses CSV
│   ├── layout.tsx                # Root layout (next-intl provider)
│   └── globals.css
│
├── components/
│   ├── charts/                   # All 'use client' — Chart.js wrappers
│   │   ├── DimensionBar.tsx
│   │   ├── ENPSGauge.tsx
│   │   ├── RadarChart.tsx
│   │   ├── YearOverYearBar.tsx
│   │   └── index.ts
│   ├── survey/                   # Survey form UI pieces
│   │   ├── LikertScale.tsx
│   │   ├── OpenTextQuestion.tsx
│   │   ├── SectionTOC.tsx        # Floating table of contents
│   │   └── ProgressBar.tsx
│   ├── admin/                    # Admin UI pieces
│   │   ├── SMTPConfigModal.tsx
│   │   ├── SurveyCreateForm.tsx
│   │   └── EmailDispatchPanel.tsx
│   └── ui/                       # Shared primitives (buttons, inputs)
│
├── lib/
│   ├── services/
│   │   ├── csv.service.ts        # Read/write/update CSV (local + Vercel Blob)
│   │   ├── email.service.ts      # Nodemailer transporter factory
│   │   ├── token.service.ts      # Token generation and validation
│   │   └── analytics.service.ts  # Score aggregation from raw responses
│   ├── auth.ts                   # Session cookie sign/verify (jose)
│   ├── constants.ts              # Dimension definitions, question mappings
│   └── types.ts                  # Shared TypeScript interfaces
│
├── data/                         # CSV files (gitignored in production)
│   ├── surveys.csv
│   ├── responses.csv
│   └── tokens.csv
│
├── messages/
│   ├── en.json                   # English UI strings
│   └── mm.json                   # Burmese UI strings
│
├── i18n/
│   └── request.ts                # next-intl request config
│
└── middleware.ts                 # Auth guard + token validation
```

### Structure Rationale

- **(admin)/ route group:** Collocates all admin pages under one layout that enforces auth check. Route group syntax means the `(admin)` folder does not appear in URLs — `/admin/page.tsx` maps to `/admin`.
- **(public)/ route group:** Survey form and thank-you pages share a minimal layout (no nav), isolated from admin chrome.
- **`components/charts/` all `'use client'`:** Chart.js requires browser APIs. Server components fetch data and pass it as props to chart components — clean server/client boundary.
- **`lib/services/`:** All file I/O, email, and computation logic isolated from API routes. API routes become thin handlers. Services are testable independently.
- **`data/` at root:** CSV files stay outside `src/` so they are not bundled. On Vercel, these are replaced by Vercel Blob reads.
- **`messages/` at root:** next-intl convention; loaded per-request by `i18n/request.ts`.

## Architectural Patterns

### Pattern 1: Server-Fetches, Client-Renders (Dashboard Charts)

**What:** Page server components fetch and aggregate CSV data, then pass serializable props to `'use client'` chart components. No data fetching on the client side.
**When to use:** Any Chart.js component — they require browser DOM APIs and cannot run in RSC.
**Trade-offs:** Simpler data loading, no client-side loading spinners for initial render. Props must be JSON-serializable (no Date objects, no class instances).

**Example:**
```typescript
// app/(admin)/admin/page.tsx — Server Component
import { DimensionBar } from '@/components/charts/DimensionBar'
import { analyticsService } from '@/lib/services/analytics.service'

export default async function DashboardPage() {
  const scores = await analyticsService.getDimensionScores()
  return <DimensionBar data={scores} /> // client component receives plain data
}
```

### Pattern 2: Token-Gated Survey Access

**What:** Each survey invite generates a unique opaque token stored in `tokens.csv` with `{token, surveyId, email, used, createdAt}`. The survey page at `/survey/[token]` validates server-side before rendering. Marking a token as `used=true` after submission prevents re-entry.
**When to use:** All survey form access — replaces authentication for respondents.
**Trade-offs:** Simple to implement, no respondent accounts needed. Tokens are single-use; lost email = no re-access (acceptable per requirements).

**Example:**
```typescript
// app/(public)/survey/[token]/page.tsx — Server Component
import { tokenService } from '@/lib/services/token.service'
import { notFound } from 'next/navigation'

export default async function SurveyPage({ params }: { params: { token: string } }) {
  const token = await tokenService.validate(params.token)
  if (!token || token.used) return notFound()
  // render survey form, pre-filling email from token record
}
```

### Pattern 3: CSV Read-Mutate-Write (No Append API)

**What:** Vercel Blob is object storage — it has no append operation. The pattern for all CSV mutations is: (1) download full CSV text, (2) parse to array, (3) push new row or update existing, (4) re-serialize, (5) upload the full file back. Locally in dev, use `fs.readFileSync`/`fs.writeFileSync`.
**When to use:** Every response submission, every token mark-as-used, every survey update.
**Trade-offs:** Works cleanly at this scale (hundreds to low thousands of responses). Becomes a race condition problem under concurrent writes — acceptable for a single-organization deployment.

**Example:**
```typescript
// lib/services/csv.service.ts
async function appendRow(filename: string, row: Record<string, string>) {
  const existing = await readCSV(filename)   // fetch from Blob or local fs
  existing.push(row)
  await writeCSV(filename, existing)          // put back to Blob or local fs
}
```

### Pattern 4: Static Admin Auth with jose JWT Cookies

**What:** Admin submits username/password. Server compares against env vars. On match, signs a JWT with `jose` (edge-compatible) and sets it as an `HttpOnly` cookie. `middleware.ts` verifies the JWT cryptographically on every `/admin/*` request.
**When to use:** All admin route protection — simple, no external auth service needed.
**Trade-offs:** Secure for single-admin use. Does not support multiple admin users or role-based access. If secret key leaks, tokens must be rotated manually.

## Data Flow

### Survey Creation and Dispatch Flow

```
Admin fills survey form
    ↓
POST /api/surveys → csv.service.write(surveys.csv)
    ↓
Admin inputs employee emails + selects survey
    ↓
POST /api/email
    → token.service.generateBatch(emails, surveyId)
        → csv.service.append(tokens.csv)
    → email.service.sendBulk(emails, tokens)
        → SMTP server (external)
```

### Survey Response Flow

```
Employee clicks email link → /survey/[token]
    ↓
Server: tokenService.validate(token) — reads tokens.csv
    ↓ (invalid/used → 404)
    ↓ (valid → render bilingual form)
Employee submits form
    ↓
POST /api/responses
    → tokenService.markUsed(token) — read-mutate-write tokens.csv
    → csv.service.appendRow(responses.csv, responseData)
    ↓
Redirect → /thank-you
```

### Analytics Data Flow

```
Admin opens /admin/results/[surveyId]
    ↓
Server Component: analyticsService.getDimensionScores(surveyId)
    → csv.service.readAll(responses.csv)
    → filter by surveyId
    → group statements by dimension mapping (constants.ts)
    → compute favorable % per dimension and sub-pillar
    → compute ENPS (promoters − detractors)
    → compute top/bottom 10 statement rankings
    ↓
Pass aggregated data as props to 'use client' chart components
    ↓
Chart.js renders in browser
```

### i18n Data Flow

```
Request arrives at /survey/[token]
    ↓
middleware.ts detects locale (Accept-Language or URL prefix)
    ↓
next-intl i18n/request.ts loads messages/{locale}.json
    ↓
Server Component passes locale-aware messages to page
    ↓
Survey form renders in EN or MM based on user preference
    ↓ (language switcher)
Client-side locale toggle re-renders form in alternate language
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 org, <500 responses | Current CSV architecture — works fine, no changes |
| 1 org, 500-5k responses | CSV reads stay fast; watch out for concurrent submission race on Vercel Blob. Add response queue or optimistic locking. |
| Multi-org or >5k responses | Replace CSV with SQLite (single-file, zero-infra) or Postgres. Analytics queries become SQL. Everything else stays the same. |

### Scaling Priorities

1. **First bottleneck:** Concurrent response submissions on Vercel Blob (read-mutate-write is not atomic). Mitigation at this scale: survey windows are time-boxed, concurrent load is low for a single org.
2. **Second bottleneck:** Analytics aggregation reads the entire responses.csv on every dashboard load. Mitigation: add a simple in-memory aggregation cache per deploy, or pre-aggregate on submission.

## Anti-Patterns

### Anti-Pattern 1: Chart.js in Server Components

**What people do:** Import a Chart.js wrapper directly in a page or layout without `'use client'`.
**Why it's wrong:** Chart.js calls browser APIs (`window`, `canvas`) that do not exist in the Node.js RSC runtime. Build fails or silently produces an empty chart.
**Do this instead:** Every component that touches Chart.js must have `'use client'` at the top. Server page fetches data → passes as props → client chart component renders.

### Anti-Pattern 2: Writing CSV on the Client Side

**What people do:** Send raw response data to the client, then have the client POST it back to create CSV rows.
**Why it's wrong:** Exposes the entire response dataset to the browser, creates duplicate submission risk, cannot safely verify token state.
**Do this instead:** CSV writes happen only in server-side API routes. Client sends form data, server validates token and writes.

### Anti-Pattern 3: One Giant responses.csv

**What people do:** Dump all survey responses for all surveys into one file with a `surveyId` column.
**Why it's wrong:** Works fine initially. When you read-mutate-write for append operations, the file gets large and each write re-uploads the entire file to Vercel Blob. Slow and wasteful.
**Do this instead:** Partition by survey: `responses-{surveyId}.csv`. Each survey's submissions are isolated. Reads and writes are faster and bounded.

### Anti-Pattern 4: Fetching CSV Data Inside Client Components

**What people do:** `useEffect(() => fetch('/api/responses'))` inside a chart component to load data.
**Why it's wrong:** Creates a client-side waterfall (page loads → component mounts → fetch fires). Dashboard shows loading spinners. Increases client JS bundle.
**Do this instead:** Fetch in the server component page, pass pre-aggregated data as props to chart components. Initial render is instant.

### Anti-Pattern 5: Putting SMTP Credentials in CSV

**What people do:** Store admin-configured SMTP host/user/pass in the same CSV store as survey data.
**Why it's wrong:** SMTP credentials are secrets. CSV files are plain text and may be exported or accidentally exposed.
**Do this instead:** Store SMTP config in a separate `smtp-config.json` that is excluded from exports. On Vercel, use environment variables or Vercel Blob with restricted access policies.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| SMTP server (admin-configured) | Nodemailer transporter, created per-request from stored config | Config stored server-side only; never exposed to client |
| Vercel Blob | `@vercel/blob` SDK in `csv.service.ts`; local `fs` in dev | Abstract behind `StorageAdapter` interface so local/production behavior is swappable |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component → Chart.js Client Component | Props (serializable JSON only) | No Date objects, no class instances across the boundary |
| API Route → Service Layer | Direct function call (same process) | Services never import from `app/` — unidirectional dependency |
| `middleware.ts` → Auth | `jose` JWT verify using `ADMIN_SECRET` env var | Must use edge-compatible crypto — no `crypto` Node built-in |
| Admin pages → Survey form pages | No direct coupling; only share `lib/types.ts` and `messages/` | Route groups enforce visual and logical isolation |
| `csv.service` → Storage | `StorageAdapter` interface with `LocalAdapter` (dev) and `BlobAdapter` (prod) | Swap via `NODE_ENV` check; keeps services testable |

## Build Order Implications

The component dependency graph suggests this build sequence:

1. **Foundation first:** `lib/types.ts`, `lib/constants.ts` (dimension mappings, question IDs) — everything else depends on these.
2. **Storage layer:** `csv.service.ts` with `StorageAdapter` — blocks all data persistence.
3. **Auth:** `lib/auth.ts` + `middleware.ts` + `/api/auth` + `/login` — blocks all admin pages.
4. **Token system:** `token.service.ts` — blocks survey dispatch and survey form access.
5. **Survey CRUD:** `/api/surveys` + admin survey create/list pages — needed before email dispatch.
6. **Email service:** `email.service.ts` + `/api/email` + SMTP settings page — depends on surveys and tokens existing.
7. **Survey form:** `/survey/[token]` + all question components + i18n messages — depends on token system.
8. **Response ingestion:** `/api/responses` + `csv.service` append — depends on survey form and token system.
9. **Analytics:** `analytics.service.ts` — depends on responses existing.
10. **Charts:** All `components/charts/*` + dashboard pages — depends on analytics service.

## Sources

- [Next.js App Router Project Structure (official)](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [next-intl App Router getting started](https://next-intl.dev/docs/getting-started/app-router)
- [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Nodemailer SMTP in Next.js (2026)](https://mailtrap.io/blog/nextjs-send-email/)
- [Building Next.js Dashboard with Chart.js and SSR](https://cube.dev/blog/building-nextjs-dashboard-with-dynamic-charts-and-ssr)
- [CVE-2025-29927 middleware bypass — JWT must be cryptographically verified](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)

---
*Architecture research for: Survey Yoma — Employee Culture Survey Platform (Next.js + CSV + SMTP + i18n)*
*Researched: 2026-04-01*
