---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, typescript, vitest, papaparse, vercel-blob, next-intl, shadcn]

# Dependency graph
requires: []
provides:
  - Next.js 16 project scaffold with TypeScript, Tailwind, shadcn/ui
  - Shared types: Question, Survey, Response, Token (src/lib/types.ts)
  - 47 GPTW Likert questions with English + Burmese text (src/lib/constants.ts)
  - 2 open-ended questions (OE-01, OE-02)
  - 3 demographic fields (DEM-ORG, DEM-YEAR, DEM-ROLE)
  - StorageAdapter interface + LocalAdapter (dev) + BlobAdapter (prod)
  - getStorageAdapter() factory pattern
  - CSV service: parseCSV, serializeCSV, readRows, appendRow with ETag retry
  - Vitest test framework configured
  - .env.example with all required environment variable keys
affects: [02-auth, 03-i18n, 04-survey-form, 05-admin, 06-responses, 07-analytics]

# Tech tracking
tech-stack:
  added:
    - next 16.2.2
    - next-intl 4.8.4
    - iron-session 8.0.4
    - jose 6.2.2
    - "@vercel/blob 2.3.2"
    - papaparse 5.5.3
    - zod 4.3.6
    - "@fontsource-variable/noto-sans-myanmar 5.2.1"
    - vitest 4.1.2
    - "@vitejs/plugin-react 6.0.1"
    - vite-tsconfig-paths 6.1.1
    - shadcn/ui
  patterns:
    - StorageAdapter pattern for filesystem abstraction (LocalAdapter dev / BlobAdapter prod)
    - ETag retry loop (5 retries) for concurrent Vercel Blob writes
    - Header-keyed CSV parsing (papaparse, dynamicTyping:false) — never index-based
    - getStorageAdapter() singleton factory via module-level variable
    - next-intl plugin with i18n/request.ts stub for build-time resolution

key-files:
  created:
    - src/lib/types.ts
    - src/lib/constants.ts
    - src/lib/storage/adapter.ts
    - src/lib/storage/local.adapter.ts
    - src/lib/storage/blob.adapter.ts
    - src/lib/storage/index.ts
    - src/lib/services/csv.service.ts
    - vitest.config.ts
    - .env.example
    - src/i18n/request.ts
    - __tests__/lib/csv.service.test.ts
    - __tests__/lib/constants.test.ts
    - __tests__/lib/storage.test.ts
  modified:
    - next.config.ts
    - package.json
    - .gitignore

key-decisions:
  - "PDF confirmed 47 Likert questions (not 46 as plan stated) — RES-36 through RES-46 = 11 Respect questions + UNC-47 = 47 total. Test updated to expect 47."
  - "Burmese text populated from PDF (not stubbed with empty strings) — all 47 questions have Myanmar Unicode text extracted from YFS Culture Survey PDF"
  - "StorageAdapter singleton cached in module scope — safe for Next.js server components, reset between test runs via test-specific LocalAdapter instances"
  - "BlobAdapter.write uses allowOverwrite:true with optional ifMatch for ETag concurrency control"

patterns-established:
  - "Pattern: StorageAdapter — all file I/O goes through getStorageAdapter(). Never use fs.writeFile directly outside src/lib/storage/local.adapter.ts"
  - "Pattern: CSV safety — always use parseCSV/serializeCSV from csv.service.ts, never raw papaparse calls in feature code"
  - "Pattern: appendRow for response writes — use ETag retry loop, not direct adapter.write, to handle concurrent submissions"
  - "Pattern: Test isolation — LocalAdapter accepts dataDir constructor arg so tests use data-test/ and never pollute data/"

requirements-completed: [FOUN-01, FOUN-02, FOUN-03, FOUN-04, DATA-02]

# Metrics
duration: 9min
completed: 2026-04-01
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16 + TypeScript scaffold with 47 GPTW survey questions (English + Burmese Unicode), StorageAdapter abstraction for Vercel Blob/local filesystem, and header-keyed CSV service with ETag retry concurrency protection**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-01T07:35:26Z
- **Completed:** 2026-04-01T07:44:50Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments

- Bootstrapped Next.js 16 with TypeScript, Tailwind CSS, shadcn/ui, and all Phase 1 dependencies (next-intl, iron-session, jose, @vercel/blob, papaparse, zod)
- Defined 47 GPTW Likert survey questions with English text from PDF and Burmese Unicode text extracted directly from the survey PDF (no stubs needed)
- Implemented StorageAdapter pattern with LocalAdapter (dev) and BlobAdapter (prod) behind a factory function — all CSV read/write is abstracted from day 1
- CSV service with header-keyed parsing (papaparse, dynamicTyping:false), serialization, and appendRow with 5-retry ETag loop for Vercel Blob concurrent write safety
- 16 vitest tests passing across constants, storage, and CSV service suites; npx next build exits 0

## Task Commits

1. **Task 1: Bootstrap Next.js project with vitest scaffold and test stubs** - `2319622` (feat)
2. **Task 2: Define TypeScript types and GPTW constants** - `773f1e3` (feat)
3. **Task 3: Implement StorageAdapter and CSV service** - `a95556c` (feat)

## Files Created/Modified

- `src/lib/types.ts` — QuestionType, Dimension, Question, Survey, Response, Token interfaces
- `src/lib/constants.ts` — GPTW_QUESTIONS (47), OPEN_ENDED_QUESTIONS (2), DEMOGRAPHIC_FIELDS (3), ALL_QUESTIONS
- `src/lib/storage/adapter.ts` — StorageAdapter interface
- `src/lib/storage/local.adapter.ts` — LocalAdapter using fs/promises; accepts dataDir for test isolation
- `src/lib/storage/blob.adapter.ts` — BlobAdapter using @vercel/blob with allowOverwrite and ifMatch
- `src/lib/storage/index.ts` — getStorageAdapter() singleton factory (production = Blob, dev = Local)
- `src/lib/services/csv.service.ts` — parseCSV, serializeCSV, readRows, appendRow with ETag retry
- `vitest.config.ts` — Node environment, path alias, test include patterns
- `.env.example` — ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_JWT_SECRET, IRON_SESSION_PASSWORD, BLOB_READ_WRITE_TOKEN
- `src/i18n/request.ts` — Stub for next-intl plugin (Plan 01-03 replaces with full implementation)
- `next.config.ts` — next-intl plugin wrapping
- `package.json` — name fix, test/test:watch scripts
- `.gitignore` — Added !.env.example exception
- `__tests__/lib/constants.test.ts` — 7 tests for GPTW_QUESTIONS and ALL_QUESTIONS
- `__tests__/lib/storage.test.ts` — 5 tests for LocalAdapter
- `__tests__/lib/csv.service.test.ts` — 4 tests for parseCSV, serializeCSV, appendRow

## Decisions Made

- Updated GPTW question count from 46 to 47: PDF + CONTEXT.md both confirm Respect dimension has RES-36 through RES-46 (11 questions) plus UNC-47, totaling 47. Plan's "46" was a counting error.
- Burmese text populated from PDF directly: The survey PDF was accessible and contained Burmese Unicode text for all questions. No stubs (`''`) were needed.
- StorageAdapter singleton cached at module level (not request level) — safe for Next.js server environment since adapter has no request-scoped state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed GPTW question count: 47 not 46**
- **Found during:** Task 2 (GPTW constants implementation)
- **Issue:** Plan stated GPTW_QUESTIONS.length === 46 but the PDF + CONTEXT.md both list RES-36 through RES-46 (11 questions) plus UNC-47 = 47 total. Running the test confirmed 47 questions exist.
- **Fix:** Updated test expectation from 46 to 47 with a comment explaining the count. All 47 questions in constants.ts.
- **Files modified:** `__tests__/lib/constants.test.ts`, `src/lib/constants.ts`
- **Verification:** `npx vitest run __tests__/lib/constants.test.ts` — 7 tests pass
- **Committed in:** `773f1e3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - count correction based on authoritative PDF)
**Impact on plan:** Necessary correction — using the wrong count would have caused runtime errors in Phase 3 survey form rendering and Phase 4 analytics dashboard.

## Issues Encountered

- `create-next-app` refused to run in the project directory because `.planning/` and `assets/` folders existed. Resolved by scaffolding into a temp directory (`survey-yoma-temp`) then rsync-ing into the project directory, excluding `.git`, `.planning`, and `assets`.
- `.gitignore` had `.env*` pattern blocking `.env.example`. Added `!.env.example` exception.

## User Setup Required

None - no external service configuration required for this plan. Production Vercel Blob requires BLOB_READ_WRITE_TOKEN but that is documented in .env.example for Phase 3 deployment.

## Next Phase Readiness

- Plan 01-02 (admin authentication) can proceed immediately — types, constants, StorageAdapter, and CSV service are all available
- Plan 01-03 (i18n) can overwrite `src/i18n/request.ts` with the full implementation
- All downstream plans must use `getStorageAdapter()` — never `fs.writeFile` directly
- All CSV access must go through `csv.service.ts` — never raw papaparse

---
*Phase: 01-foundation*
*Completed: 2026-04-01*
