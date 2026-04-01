---
phase: 03-employee-survey-form
verified: 2026-04-01T20:10:00Z
status: passed
score: 17/17 must-haves verified
re_verification: false
---

# Phase 3: Employee Survey Form — Verification Report

**Phase Goal:** Employees can access their unique survey URL, complete the bilingual multi-section Likert form with open-ended and demographic questions, and submit — responses are persisted and the token is invalidated
**Verified:** 2026-04-01T20:10:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `findTokenByValue(token)` scans all survey token files and returns the correct Token row | VERIFIED | `src/lib/services/token.service.ts` lines 79–96; reads `surveys.csv` then iterates `tokens-{surveyId}.csv` files |
| 2 | `markTokenUsed(token, surveyId)` sets `status='submitted'` and `submittedAt`; leaves other rows unchanged | VERIFIED | `token.service.ts` lines 102–111; read-mutate-write pattern; `.map(r => r.token === token ? {...r, status:'submitted', submittedAt: ISO} : r)` |
| 3 | `validateAnswers(questions, answers)` returns array of unanswered required (likert + demographic) question IDs; open_ended is excluded | VERIFIED | `src/lib/validation/survey-validation.ts` lines 9–16; filters out `open_ended`, checks for empty/missing string |
| 4 | `POST /api/surveys/[id]/submit` returns 400 for missing token, 400 for missing answers, 410 for invalid/used token, 200 `{success:true}` on valid submission | VERIFIED | `src/app/api/surveys/[id]/submit/route.ts`; all 6 submit tests pass |
| 5 | `appendRow` is called strictly before `markTokenUsed` (ordering enforced) | VERIFIED | `route.ts` lines 55–56; ordering test in `survey-submit.test.ts` passes |
| 6 | Response row written to `responses-{surveyId}.csv` contains all question IDs as columns; missing optional answers default to empty string | VERIFIED | `route.ts` lines 37–44 initialize all IDs to `''` before merging answers; column-consistency test passes |
| 7 | Employee opens `/[locale]/survey/{token}` and sees form with email readonly; used-token URL renders friendly error page | VERIFIED | `page.tsx`: `findTokenByValue` → if `status==='submitted'` renders inline error; else renders `SurveyForm` with `tokenRow.email` readonly |
| 8 | Form displays all GPTW sections (Camaraderie, Credibility, Fairness, Pride, Respect), open-ended, and demographics sections | VERIFIED | `SurveyForm.tsx` `SECTION_ORDER` array; sections grouped by `question.dimension` for likert and `question.type` for open_ended/demographic |
| 9 | Desktop: floating TOC (240px sticky left sidebar) shows each section with completion count; clicking scrolls to section | VERIFIED | `TableOfContents.tsx`; `w-60 sticky top-24 hidden lg:block`; `handleScrollTo` calls `scrollIntoView`; completion checkmarks rendered |
| 10 | Mobile: sticky top bar (z-30) with horizontally scrollable section names and 4px progress bar underneath | VERIFIED | `MobileProgressBar.tsx`; `sticky top-0 z-30 lg:hidden`; `overflow-x-auto`; `h-1 bg-blue-600` progress bar |
| 11 | Language switcher (EN\|MY) toggles all question text between English and Burmese without resetting form answers | VERIFIED | `SurveyForm.tsx` uses local `displayLocale` state (not URL navigation); `setDisplayLocale(lang)` only updates display, `answers` state untouched |
| 12 | Likert questions render 5 options with desktop horizontal / mobile vertical layout; blue-50/blue-200 selected state; red border on error | VERIFIED | `LikertInput.tsx`; `flex flex-col sm:flex-row`; `isSelected ? 'bg-blue-50 border-blue-200'`; `border-2 border-red-400 bg-red-50` on error |
| 13 | Demographics: Organization and Service Year as Select dropdowns; Role Type as radio group; all options bilingual | VERIFIED | `SurveyForm.tsx` lines 336–409; radio path when `id.includes('role')` + has options; Select path for others; `displayLocale` controls label text |
| 14 | Open-ended textarea: rows={4}, max-height 400px, "Optional" helper text, live character count below | VERIFIED | `SurveyForm.tsx` lines 302–333; `rows={4}`, `maxHeight:'400px'`, "Optional — share as much or as little as you would like", `{charCounts[q.id] ?? 0} characters` |
| 15 | Confirmation dialog: CheckCircle (blue-600, 48px), "Ready to Submit?", anonymity reminder, Submit/Cancel buttons; ESC and backdrop dismissible | VERIFIED | `ConfirmationDialog.tsx`; `CheckCircle w-12 h-12 text-blue-600`; `DialogTitle "Ready to Submit?"`; shadcn/ui Dialog handles ESC/backdrop natively |
| 16 | Thank-you screen: green CheckCircle (64px), "Thank You!" heading, FadeIn animation, no "take another survey" CTA | VERIFIED | `ThankYouScreen.tsx`; `CheckCircle w-16 h-16 text-green-600`; wrapped in `<FadeIn>`; no CTA present |
| 17 | Validation: unanswered required questions highlighted red; auto-scroll to first error; subsequent changes clear that question's error | VERIFIED | `SurveyForm.tsx` lines 102–115; `validateAnswers` → `setErrors`; `scrollIntoView` on `q-{firstError}`; `handleAnswer` deletes from error set when `hasSubmitAttempted` |

**Score:** 17/17 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/services/token.service.ts` | `findTokenByValue` + `markTokenUsed` exports | VERIFIED | Both functions exported; `writeRows` imported; 112 lines |
| `src/lib/validation/survey-validation.ts` | `validateAnswers` pure function | VERIFIED | Exported at line 9; 17 lines |
| `src/app/api/surveys/[id]/submit/route.ts` | Public POST endpoint for survey submission | VERIFIED | `POST` exported; 59 lines; full implementation |
| `__tests__/services/token.service.test.ts` | findTokenByValue + markTokenUsed test cases | VERIFIED | File exists; token service tests pass |
| `__tests__/api/survey-submit.test.ts` | Submit API tests for 410/200/column consistency | VERIFIED | 6 test cases; all pass |
| `__tests__/lib/survey-validation.test.ts` | validateAnswers unit tests | VERIFIED | 5 test cases; all pass |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/[locale]/survey/[token]/page.tsx` | Server Component: token validation, data loading, error states | VERIFIED | 56 lines; `findTokenByValue` → error states → `SurveyForm` |
| `src/app/[locale]/survey/[token]/loading.tsx` | Loading skeleton | VERIFIED | Spinner + "Loading your survey..." text |
| `src/app/[locale]/survey/[token]/not-found.tsx` | 404 error UI | VERIFIED | AlertCircle + "Survey link not found" |
| `src/components/survey/SurveyForm.tsx` | Client Component: form state machine | VERIFIED | 450 lines; full state machine with 7 states |
| `src/components/survey/LikertInput.tsx` | Desktop horizontal / mobile vertical radio group | VERIFIED | 78 lines; `flex flex-col sm:flex-row` layout |
| `src/components/survey/SectionCard.tsx` | Section wrapper with `id="section-{sectionId}"` | VERIFIED | `id={\`section-${sectionId}\`}` at line 24 |
| `src/components/survey/TableOfContents.tsx` | IntersectionObserver-based TOC | VERIFIED | 96 lines; proper observer setup and cleanup |
| `src/components/survey/MobileProgressBar.tsx` | Sticky mobile progress header | VERIFIED | 57 lines; `sticky top-0 z-30 lg:hidden` |
| `src/components/survey/ConfirmationDialog.tsx` | Submission confirmation modal | VERIFIED | 57 lines; shadcn/ui Dialog |
| `src/components/survey/ThankYouScreen.tsx` | Post-submission FadeIn screen | VERIFIED | 22 lines; FadeIn + no CTA |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `page.tsx` | `token.service.ts` | `findTokenByValue(token)` | WIRED | Imported at line 4; called at line 16 |
| `SurveyForm.tsx` | `route.ts` | `fetch POST /api/surveys/${survey.id}/submit` | WIRED | `fetch` call at line 121; response handled at lines 127–137 |
| `TableOfContents.tsx` | `SectionCard.tsx` sections | `IntersectionObserver` on `id="section-{sectionId}"` elements | WIRED | Observer observes `document.getElementById('section-'+section.id)` at line 33 |
| `SurveyForm.tsx` | `survey-validation.ts` | `validateAnswers(questions, answers)` | WIRED | Imported at line 15; called at line 103 |
| `route.ts` | `token.service.ts` | `markTokenUsed` after `appendRow` | WIRED | `appendRow` line 55, `markTokenUsed` line 56 |
| `route.ts` | `csv.service.ts` | `appendRow('responses-${surveyId}.csv', row)` | WIRED | Line 55: `await appendRow(\`responses-${surveyId}.csv\`, responseRow)` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FORM-01 | 03-01 | Employee accesses survey via unique URL with token; email pre-filled from token lookup | SATISFIED | `page.tsx` uses `findTokenByValue`; `SurveyForm` renders email in readonly input |
| FORM-02 | 03-02 | Survey form displays in multi-section layout with floating TOC on left side | SATISFIED | `SurveyForm.tsx` renders `TableOfContents` in `hidden lg:block w-60` sidebar |
| FORM-03 | 03-02 | Floating TOC tracks progress showing completed/remaining sections | SATISFIED | `TableOfContents.tsx` renders `answeredCount/totalCount` per section with checkmarks |
| FORM-04 | 03-02 | Survey renders in selected language with language switcher | SATISFIED | EN/MY segmented control in `SurveyForm`; `displayLocale` state drives `q(question)` helper |
| FORM-05 | 03-02 | Likert scale shows 5 options in selected language | SATISFIED | `LikertInput.tsx` `LIKERT_OPTIONS` array with EN/MY labels |
| FORM-06 | 03-02 | Open-ended questions provide text area input | SATISFIED | `SurveyForm.tsx` `Textarea rows={4}` for `open_ended` type questions |
| FORM-07 | 03-02 | Demographic section: Organization, Service Year, Role Type with predefined bilingual options | SATISFIED | Select dropdowns and RadioGroup for demographic questions; `displayLocale` controls labels |
| FORM-08 | 03-01 | Form validation with inline error messages | SATISFIED | `errors` Set drives `error` prop on `LikertInput`; "Required" spans on demographic labels; error count badge |
| FORM-09 | 03-01, 03-02 | Confirmation dialog shown before final submission | SATISFIED | `ConfirmationDialog` shown via `showConfirmDialog` state in `SurveyForm` |
| FORM-10 | 03-01 | Token marked as used server-side upon submission | SATISFIED | `markTokenUsed` called in `route.ts` after `appendRow` succeeds |
| FORM-11 | 03-01 | Responses persisted to CSV file partitioned by survey ID | SATISFIED | `appendRow('responses-${surveyId}.csv', responseRow)` in `route.ts` line 55 |
| FORM-12 | 03-02 | Basic information fields (name, department) available as optional inputs | SATISFIED | Name + Department text inputs in demographic section (`__name__`, `__department__` keys) |

All 12 requirements: SATISFIED.

No orphaned requirements found — all FORM-01 through FORM-12 are claimed by Plans 01 or 02 and verified in the codebase.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No TODO/FIXME/placeholder comments found in phase files. No empty implementations. No stub returns. All handlers make real API calls.

**Notable:** `SurveyForm.tsx` line 132 uses `alert()` for submission error display. This is functional but not ideal UX. Not a blocker.

---

## Human Verification Required

### 1. End-to-end survey submission flow

**Test:** Start dev server. Use an invitation email token from a test survey. Open `/en/survey/{token}` in a browser. Complete all required questions. Submit. Check that `responses-{surveyId}.csv` has a new row and the token in `tokens-{surveyId}.csv` is marked `status=submitted`.
**Expected:** Form loads with email pre-filled, all 7 sections render, submission completes without error, thank-you screen displays.
**Why human:** Cannot run Next.js App Router Server Components in test environment; requires real browser + dev server + actual CSV state.

### 2. Language toggle preserves answers

**Test:** Answer 3 Likert questions in EN, then click MY, then click EN again.
**Expected:** All 3 answers remain selected after each toggle; question text changes language but state persists.
**Why human:** React state across locale toggle requires visual browser verification.

### 3. Mobile layout verification

**Test:** Open survey on mobile (or DevTools responsive mode). Verify sticky top bar is visible, desktop TOC is hidden, Likert options stack vertically.
**Expected:** `MobileProgressBar` visible at top; `TableOfContents` hidden; `LikertInput` `flex-col` layout.
**Why human:** CSS responsive breakpoints require browser rendering to verify.

### 4. IntersectionObserver TOC tracking

**Test:** Scroll through the survey. Verify the active section in the desktop TOC updates as each section scrolls into the -20% to -60% viewport window.
**Expected:** TOC highlights the currently visible section; section completion checkmarks appear as questions are answered.
**Why human:** IntersectionObserver behavior requires real DOM with scroll.

---

## Gaps Summary

No gaps. All 17 observable truths are verified, all 16 artifacts exist and are substantive, all 6 key links are wired, all 12 requirements (FORM-01 through FORM-12) are satisfied.

The test suite passes cleanly: 73 tests across 12 files, 0 failures. TypeScript exits 0. Both i18n JSON files validate.

The accepted deviation (HTTP 200 instead of 410 for used-token page) is correctly documented and technically justified — Next.js App Router `page.tsx` cannot set custom HTTP status codes; the API route at `POST /api/surveys/[id]/submit` correctly returns 410 as specified.

---

_Verified: 2026-04-01T20:10:00Z_
_Verifier: Claude (gsd-verifier)_
