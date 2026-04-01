---
phase: 02-survey-creation-and-distribution
plan: 02
subsystem: email
tags: [nodemailer, smtp, tokens, csv, next-intl, base-ui, react, forms]

# Dependency graph
requires:
  - phase: 02-survey-creation-and-distribution
    provides: survey.service (listSurveys, getSurvey), csv.service (readRows, appendRow, writeRows), Survey types
  - phase: 01-foundation
    provides: iron-session auth, StorageAdapter, Next.js scaffold

provides:
  - smtp.service: getSmtpSettings, saveSmtpSettings (reads/writes smtp-settings.csv)
  - token.service: generateToken (idempotent, 64-char hex), validateToken, listTokens
  - email.service: createTransporter, testSmtpConnection, sendInvitation (nodemailer)
  - GET/PUT /api/settings/smtp (password write-only; GET returns empty password string)
  - POST /api/settings/smtp/test (returns {ok, error}, never 500)
  - POST /api/surveys/[id]/invite (sequential for-of send, generateToken idempotency)
  - SMTPSettingsForm: 6-field form with Eye/EyeOff password toggle, inline test feedback
  - SMTPOnboardingModal: non-dismissible (disablePointerDismissal + onOpenChange intercept)
  - AdminLayoutClient: fires modal on all admin pages except /admin/settings
  - EmailDistributionForm: email parsing, survey select, progress, invitation history table
  - /admin/surveys/[id]/invite: server component with persistent invitation log

affects:
  - 02-03 (survey response form — needs validateToken for link-based access)
  - 03-analytics (invitation logs in tokens-{surveyId}.csv)

# Tech tracking
tech-stack:
  added: [nodemailer, sonner]
  patterns:
    - Token idempotency via CSV lookup before crypto.randomBytes(32) generation
    - Password write-only: GET strips password, PUT preserves existing if blank sent
    - Sequential email send (for...of) to avoid SMTP rate limiting
    - base-ui Dialog non-dismiss via disablePointerDismissal + onOpenChange reason intercept
    - AdminLayoutClient: server layout passes hasSmtp bool, client handles modal + sessionStorage

key-files:
  created:
    - src/lib/services/smtp.service.ts
    - src/lib/services/token.service.ts
    - src/lib/services/email.service.ts
    - src/app/api/settings/smtp/route.ts
    - src/app/api/settings/smtp/test/route.ts
    - src/app/api/surveys/[id]/invite/route.ts
    - src/app/[locale]/(admin)/admin/surveys/[id]/invite/page.tsx
    - src/components/admin/SMTPSettingsForm.tsx
    - src/components/admin/SMTPOnboardingModal.tsx
    - src/components/admin/AdminLayoutClient.tsx
    - src/components/admin/EmailDistributionForm.tsx
    - __tests__/services/token.service.test.ts
    - __tests__/services/smtp.service.test.ts
    - __tests__/services/email.service.test.ts
  modified:
    - src/app/[locale]/(admin)/layout.tsx (async server component, hasSmtp check, Toaster)
    - src/app/[locale]/(admin)/admin/settings/page.tsx (replaced stub with SMTPSettingsForm)
    - messages/en.json (settings.*, email.* sections added)
    - messages/mm.json (settings.*, email.* sections added)

key-decisions:
  - "base-ui Dialog has no onInteractOutside/onEscapeKeyDown props — use disablePointerDismissal + onOpenChange reason intercept to prevent modal dismiss"
  - "Token idempotency: generateToken reads CSV before generating — same email+surveyId always returns same token (re-send valid behavior)"
  - "Sequential for-of email send — avoids SMTP rate limiting; not Promise.all"
  - "Password write-only security: GET /api/settings/smtp always returns empty string for password field; client never receives stored credential"
  - "SMTPOnboardingModal only suppressed on /admin/settings (one exclusion); fires on dashboard, surveys, invite, any other admin page"
  - "sessionStorage key smtp-onboarding-skipped persists skip for browser session only (clears on tab close)"

patterns-established:
  - "Token CSV file naming: tokens-{surveyId}.csv"
  - "SMTP CSV file: smtp-settings.csv (single row, full overwrite via writeRows)"
  - "Survey invite link format: {NEXT_PUBLIC_BASE_URL}/{locale}/survey/{token}"
  - "Server component loads priorInvitations via listTokens() before render — history survives page reload"

requirements-completed: [EMAL-01, EMAL-02, EMAL-03, EMAL-04, EMAL-05, EMAL-06, EMAL-07, DATA-03]

# Metrics
duration: 25min
completed: 2026-04-01
---

# Phase 02 Plan 02: SMTP Email Distribution Summary

**Nodemailer SMTP pipeline with idempotent token generation, non-dismissible onboarding modal, sequential email distribution, and persistent invitation history loaded server-side from tokens-{surveyId}.csv**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-01T16:10:00Z
- **Completed:** 2026-04-01T16:15:30Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments

- smtp.service, token.service (with listTokens), and email.service with vitest coverage (54 tests pass)
- SMTP settings API (GET password-stripped, PUT password-preserving), test endpoint returning {ok,error}
- Non-dismissible SMTP onboarding modal fires on all admin pages except /admin/settings
- Invite API with sequential send, token idempotency, generates unique 64-char hex tokens per email
- EmailDistributionForm with email parsing, progress tracking, and persistent invitation history table

## Task Commits

1. **Task 1: smtp.service, token.service (with listTokens), email.service with tests** - `f3780b8` (feat)
2. **Task 2: SMTP settings API routes, settings page, SMTPSettingsForm** - `4c8bee4` (feat)
3. **Task 3: SMTP onboarding modal, email distribution form, invite API, invitation history** - `ee695e1` (feat)

## Files Created/Modified

- `src/lib/services/smtp.service.ts` - getSmtpSettings, saveSmtpSettings using csv.service
- `src/lib/services/token.service.ts` - generateToken (idempotent), validateToken, listTokens
- `src/lib/services/email.service.ts` - createTransporter (port 465 SSL), testSmtpConnection, sendInvitation
- `src/app/api/settings/smtp/route.ts` - GET (no password), PUT (preserve password if blank)
- `src/app/api/settings/smtp/test/route.ts` - POST returning {ok, error}, never 500
- `src/app/api/surveys/[id]/invite/route.ts` - POST with sequential for-of send
- `src/app/[locale]/(admin)/admin/surveys/[id]/invite/page.tsx` - server component with listTokens
- `src/components/admin/SMTPSettingsForm.tsx` - 6-field form with Eye/EyeOff toggle
- `src/components/admin/SMTPOnboardingModal.tsx` - non-dismissible via disablePointerDismissal
- `src/components/admin/AdminLayoutClient.tsx` - modal logic, sessionStorage skip
- `src/components/admin/EmailDistributionForm.tsx` - email parse, progress, history table
- `src/app/[locale]/(admin)/layout.tsx` - async, getSmtpSettings, Toaster
- `messages/en.json` - settings.* and email.* keys added
- `messages/mm.json` - settings.* and email.* keys added (bilingual)
- `__tests__/services/token.service.test.ts` - 8 tests: idempotency, 64-char, listTokens
- `__tests__/services/smtp.service.test.ts` - getSmtpSettings null case, saveSmtpSettings
- `__tests__/services/email.service.test.ts` - port-465 SSL, sendMail to address

## Decisions Made

- base-ui Dialog does not have Radix-style `onInteractOutside`/`onEscapeKeyDown` props — used `disablePointerDismissal` + `onOpenChange` reason intercept to achieve non-dismissible behavior
- Token idempotency intentional: re-inviting the same email reuses the existing token (re-send is valid)
- Sequential `for...of` email sending chosen over `Promise.all` to avoid SMTP rate limiting
- Password write-only: GET endpoint strips password entirely (returns empty string); client never receives stored SMTP credentials
- Modal fires on all admin pages except `/admin/settings` only — no other page exclusions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Select onValueChange type mismatch**
- **Found during:** Task 3 (EmailDistributionForm)
- **Issue:** base-ui Select `onValueChange` passes `string | null`, but `setSelectedSurveyId` expected `string`, causing TypeScript error
- **Fix:** Wrapped in guard: `(v) => { if (v) setSelectedSurveyId(v); }`
- **Files modified:** src/components/admin/EmailDistributionForm.tsx
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** ee695e1 (Task 3 commit)

**2. [Rule 1 - Bug] Replaced SMTPOnboardingModal prevent-dismiss approach**
- **Found during:** Task 3 (SMTPOnboardingModal)
- **Issue:** Plan specified `onInteractOutside` and `onEscapeKeyDown` props (Radix pattern), but project uses base-ui Dialog which does not expose these props — TypeScript error
- **Fix:** Used `disablePointerDismissal` prop on Dialog Root + `onOpenChange` reason intercept to block escape-key dismiss (functionally identical behavior)
- **Files modified:** src/components/admin/SMTPOnboardingModal.tsx
- **Verification:** TypeScript passes, modal logic blocks outside-press and escape-key
- **Committed in:** ee695e1 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bugs)
**Impact on plan:** Both fixes required for TypeScript correctness; behavior is identical to plan specification.

## Issues Encountered

None — all issues auto-fixed via deviation rules above.

## User Setup Required

None - no external service configuration required at this stage. SMTP credentials are configured by the admin through the UI at `/admin/settings`.

## Next Phase Readiness

- Token generation and validation fully implemented — survey response form (Phase 3) can use `validateToken(token, surveyId)` to gate access
- Invitation links in format `{baseUrl}/{locale}/survey/{token}` are ready for the survey response route
- Invitation history table loads from CSV — ready for response count updates when surveys are submitted
- All vitest tests green (54 passing), TypeScript clean

---
*Phase: 02-survey-creation-and-distribution*
*Completed: 2026-04-01*
