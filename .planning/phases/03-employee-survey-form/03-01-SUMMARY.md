---
phase: 03-employee-survey-form
plan: 01
subsystem: token-service, survey-api, i18n
tags: [tdd, token, validation, submission, i18n, csv]
dependency_graph:
  requires:
    - src/lib/services/csv.service.ts (readRows, appendRow, writeRows)
    - src/lib/services/survey.service.ts (getQuestions)
    - src/lib/services/token.service.ts (validateToken — pre-existing)
    - src/lib/types.ts (Token, Question interfaces)
  provides:
    - src/lib/services/token.service.ts (findTokenByValue, markTokenUsed exports)
    - src/lib/validation/survey-validation.ts (validateAnswers export)
    - src/app/api/surveys/[id]/submit/route.ts (POST handler)
  affects:
    - Phase 03 Plan 02 (survey form page depends on all three artifacts)
tech_stack:
  added: []
  patterns:
    - TDD (RED-GREEN per task)
    - read-mutate-write for token state mutation
    - appendRow-before-markTokenUsed ordering guarantee
    - all-question-ID column initialisation for CSV consistency
key_files:
  created:
    - src/lib/validation/survey-validation.ts
    - src/app/api/surveys/[id]/submit/route.ts
    - __tests__/lib/survey-validation.test.ts
    - __tests__/api/survey-submit.test.ts
  modified:
    - src/lib/services/token.service.ts (added findTokenByValue, markTokenUsed, writeRows import)
    - __tests__/services/token.service.test.ts (added 8 new test cases)
    - messages/en.json (added survey namespace, 32 keys)
    - messages/my.json (added survey namespace, 32 keys)
decisions:
  - findTokenByValue does not filter by status (validateToken enforces pending-only; findTokenByValue is status-agnostic for survey page lookup)
  - markTokenUsed uses read-mutate-write (not appendRow) — token files are small and full rewrite is safe
  - appendRow-before-markTokenUsed ordering enforced in route.ts — response persisted before token invalidated (FORM-11 prerequisite for FORM-10)
  - open_ended questions are optional — validateAnswers only flags likert and demographic
  - All question ID columns initialised to empty string in response row — ensures consistent CSV schema regardless of optional answers
metrics:
  duration: 5 min
  completed_date: "2026-04-01"
  tasks_completed: 3
  files_created: 4
  files_modified: 4
---

# Phase 3 Plan 1: Token Service Extensions + Survey Submit API Summary

**One-liner:** Token lookup (findTokenByValue), token invalidation (markTokenUsed), answer validation (validateAnswers), and survey submission endpoint (POST /api/surveys/[id]/submit) — all TDD-built with ordering guarantees and full i18n coverage.

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | findTokenByValue + markTokenUsed in token.service.ts | 594eb77 | Done |
| 2 | validateAnswers + POST submit route | 82cd3e5 | Done |
| 3 | Survey translation keys (en.json + my.json) | 24ed98d | Done |

## What Was Built

### Task 1: Token Service Extensions
- `findTokenByValue(token)` — scans all surveys' token CSV files; returns Token row regardless of status
- `markTokenUsed(token, surveyId)` — read-mutate-write pattern; sets `status='submitted'` and `submittedAt=<ISO string>`
- Added `writeRows` import to token.service.ts
- 8 new test cases; all 17 token service tests pass

### Task 2: validateAnswers + Submit Route
- `validateAnswers(questions, answers)` — returns array of unanswered required question IDs; open_ended is optional
- `POST /api/surveys/[id]/submit` — validates body (400), validates token (410), persists response row then invalidates token (200)
- Response row initialises all question IDs as empty strings before merging answers — CSV column consistency guaranteed
- `appendRow` called strictly before `markTokenUsed` (ordering test enforced)
- 11 new test cases; all pass

### Task 3: i18n Translation Keys
- 32 keys added under `"survey"` namespace in both `messages/en.json` and `messages/my.json`
- Covers: loading state, error states (invalid/used/not-found link), likert scale labels (5 levels), section names (6 sections), confirm dialog, thank-you screen, validation messages, progress label
- JSON validated: both files parse cleanly

## Deviations from Plan

### Pre-existing Issues (Logged to deferred-items.md)

**1. [Out of Scope - Pre-existing] i18n test references wrong filename**
- **Found during:** Full suite verification
- **Issue:** `__tests__/lib/i18n.test.ts` imports `../../messages/mm.json` but file is `messages/my.json` — pre-existing failure before plan 03-01
- **Action:** Logged to `.planning/phases/03-employee-survey-form/deferred-items.md`; not fixed (out of scope)

None of my new code caused new failures. All 65 passing tests continue to pass.

## Verification Results

```
npx vitest run --reporter=verbose
Test Files  1 failed (pre-existing) | 11 passed (12)
Tests  65 passed (65)

npx tsc --noEmit
1 error (pre-existing i18n test mm.json reference — not caused by this plan)
```

All new test files pass. All new implementations type-check cleanly.

## Self-Check: PASSED

Files created/modified exist:
- FOUND: src/lib/services/token.service.ts
- FOUND: src/lib/validation/survey-validation.ts
- FOUND: src/app/api/surveys/[id]/submit/route.ts
- FOUND: __tests__/services/token.service.test.ts
- FOUND: __tests__/lib/survey-validation.test.ts
- FOUND: __tests__/api/survey-submit.test.ts
- FOUND: messages/en.json
- FOUND: messages/my.json

Commits exist:
- 594eb77: feat(03-01): add findTokenByValue and markTokenUsed to token.service.ts
- 82cd3e5: feat(03-01): validateAnswers pure function and survey submission API route
- 24ed98d: feat(03-01): add survey translation namespace to en.json and my.json
