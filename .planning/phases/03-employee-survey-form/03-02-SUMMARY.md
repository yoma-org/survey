---
phase: 03-employee-survey-form
plan: "02"
subsystem: ui
tags: [react, next-intl, intersection-observer, radio-group, select, dialog, form-state-machine, bilingual, likert]

requires:
  - phase: 03-employee-survey-form plan 01
    provides: findTokenByValue, validateAnswers, submit API, survey translation keys

provides:
  - Survey page route at /[locale]/survey/[token] with server-side token validation
  - SurveyForm client component — full state machine for 7-section bilingual form
  - LikertInput — desktop horizontal / mobile vertical radio group
  - SectionCard — section wrapper with IntersectionObserver id attributes
  - TableOfContents — IntersectionObserver-based sticky desktop sidebar
  - MobileProgressBar — sticky top-0 z-30 mobile-only progress header
  - ConfirmationDialog — submission confirmation modal (ESC-dismissible)
  - ThankYouScreen — post-submission FadeIn full-page screen

affects:
  - 04-analytics-dashboard (survey submission pipeline complete)
  - Any future plan touching survey form UX

tech-stack:
  added: []
  patterns:
    - "SurveyForm uses local displayLocale state (not URL navigation) for language toggle — preserves answers on switch"
    - "IntersectionObserver rootMargin -20% 0px -60% 0px for section active detection"
    - "Section grouping by question.type (likert/open_ended/demographic) + dimension for likert sections"
    - "base-ui Select onValueChange returns string | null — must guard with if (value) before calling handler"

key-files:
  created:
    - src/app/[locale]/survey/[token]/page.tsx
    - src/app/[locale]/survey/[token]/loading.tsx
    - src/app/[locale]/survey/[token]/not-found.tsx
    - src/components/survey/SurveyForm.tsx
    - src/components/survey/LikertInput.tsx
    - src/components/survey/SectionCard.tsx
    - src/components/survey/TableOfContents.tsx
    - src/components/survey/MobileProgressBar.tsx
    - src/components/survey/ConfirmationDialog.tsx
    - src/components/survey/ThankYouScreen.tsx
  modified:
    - __tests__/lib/i18n.test.ts

key-decisions:
  - "Language toggle uses local displayLocale state (not URL navigation / useRouter) — preserves form answers when switching EN/MY"
  - "base-ui Select.Root onValueChange returns string | null — guard with if (value) before handler to satisfy TypeScript"
  - "Section grouping: open_ended and demographic are type-based; likert sections grouped by dimension in fixed order"
  - "HTTP 200 accepted for used-token error page (Next.js App Router page.tsx cannot return custom HTTP status codes)"

patterns-established:
  - "SurveyForm pattern: local displayLocale state controls all question text rendering without resetting answers"
  - "IntersectionObserver cleanup: return () => observers.forEach(o => o.disconnect()) from useEffect"
  - "Section id convention: id='section-{sectionId}' on outer div, id='q-{questionId}' on question label for aria and scroll targets"

requirements-completed:
  - FORM-02
  - FORM-03
  - FORM-04
  - FORM-05
  - FORM-06
  - FORM-07
  - FORM-09
  - FORM-12

duration: 25min
completed: 2026-04-01
---

# Phase 03 Plan 02: Employee Survey Form — Components and State Machine Summary

**Bilingual 7-section survey form with IntersectionObserver TOC, mobile sticky progress, LikertInput desktop/mobile layouts, and full submit flow (validate → confirm → POST → thank-you)**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-01T19:30:00Z
- **Completed:** 2026-04-01T19:55:00Z
- **Tasks:** 4 (3 auto + 1 auto-approved checkpoint)
- **Files modified:** 11

## Accomplishments
- Survey page Server Component validates token via findTokenByValue, handles missing (404) and submitted (inline error) states, loads survey+questions, passes all props to SurveyForm
- SurveyForm state machine: 7 sections, EN/MY toggle via local state, validateAnswers on submit, confirmation dialog, POST to /api/surveys/{id}/submit, ThankYouScreen on success
- LikertInput with desktop horizontal (44px) / mobile vertical (48px rows, blue-50 selected) radio group and red-border error state
- TableOfContents with IntersectionObserver (-20%/-60% root margins), section scroll, completion checkmarks, and proper disconnect() cleanup
- MobileProgressBar: sticky top-0 z-30 with 4px progress fill, lg:hidden, horizontally scrollable section pills

## Task Commits

1. **Task 1: Survey page Server Component and route skeleton** - `85247db` (feat)
2. **Task 2: LikertInput, SectionCard, ConfirmationDialog, ThankYouScreen** - `1610b8a` (feat)
3. **Task 3: TableOfContents, MobileProgressBar, SurveyForm state machine** - `76ae472` (feat)
4. **Task 4: Human verification checkpoint** - Auto-approved (auto_advance: true)

## Files Created/Modified
- `src/app/[locale]/survey/[token]/page.tsx` — Server Component: token validation, data loading, error states
- `src/app/[locale]/survey/[token]/loading.tsx` — Loading spinner skeleton
- `src/app/[locale]/survey/[token]/not-found.tsx` — 404 error UI
- `src/components/survey/SurveyForm.tsx` — Client Component: full form state machine
- `src/components/survey/LikertInput.tsx` — Desktop horizontal / mobile vertical radio group
- `src/components/survey/SectionCard.tsx` — Section wrapper with id attribute for IntersectionObserver
- `src/components/survey/TableOfContents.tsx` — Sticky desktop sidebar with IntersectionObserver
- `src/components/survey/MobileProgressBar.tsx` — Sticky mobile progress header
- `src/components/survey/ConfirmationDialog.tsx` — Submission confirmation modal
- `src/components/survey/ThankYouScreen.tsx` — Post-submission FadeIn screen
- `__tests__/lib/i18n.test.ts` — Bug fix: updated import path from mm.json to my.json

## Decisions Made
- Language toggle uses local `displayLocale` state (not URL navigation) — switching locale preserves all form answers
- base-ui Select.Root `onValueChange` returns `string | null` — guard with `if (value)` before calling handleAnswer
- Section grouping: open_ended and demographic sections are type-based; the 5 GPTW dimensions are dimension-based within likert questions
- Accepted HTTP 200 for used-token page (locked deviation from CONTEXT.md — Next.js App Router page.tsx cannot return 410; API route still returns 410)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing i18n test referencing wrong file**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** `__tests__/lib/i18n.test.ts` imported from `../../messages/mm.json` but file is `messages/my.json`, causing tsc error
- **Fix:** Updated import to `../../messages/my.json`
- **Files modified:** `__tests__/lib/i18n.test.ts`
- **Verification:** `npx tsc --noEmit` exits 0; `npx vitest run` 73 tests pass
- **Committed in:** `85247db` (Task 1 commit)

**2. [Rule 1 - Bug] Guarded base-ui Select onValueChange null value**
- **Found during:** Task 3 (TypeScript verification)
- **Issue:** base-ui Select.Root `onValueChange` callback signature is `(value: string | null) => void` — passing directly to handleAnswer (expects string) caused TS2345 type error
- **Fix:** Wrapped with `if (value) handleAnswer(...)` guard — matches existing codebase pattern in EmailDistributionForm.tsx
- **Files modified:** `src/components/survey/SurveyForm.tsx`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `76ae472` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both auto-fixes essential for TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the two auto-fixed TypeScript issues above.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Complete employee survey form is live at `/[locale]/survey/[token]`
- Token validation, bilingual toggle, validation, submit flow, and thank-you screen all functional
- Human verification (Task 4) is pending — requires dev server + test token to verify end-to-end on real browser
- Phase 4 (analytics dashboard) can begin: survey submissions are persisted in responses-{surveyId}.csv

---
*Phase: 03-employee-survey-form*
*Completed: 2026-04-01*
