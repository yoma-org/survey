---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [jose, iron-session, jwt, next-intl, shadcn, middleware, authentication]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js scaffold, TypeScript types, .env.example with ADMIN_JWT_SECRET and IRON_SESSION_PASSWORD keys
provides:
  - iron-session encrypted cookie auth with 24h session (admin_session cookie)
  - jose JWT cryptographic middleware guard for /[locale]/admin/* (CVE-2025-29927 mitigation)
  - POST /api/auth (login: signs JWT, saves iron-session) and DELETE /api/auth (logout: destroys session)
  - Centered card login page at /[locale]/login with inline error display
  - Collapsible admin shell sidebar with Dashboard/Surveys/Settings nav and logout
  - Admin placeholder pages: /[locale]/admin, /[locale]/admin/surveys, /[locale]/admin/settings
affects: [03-i18n, 04-survey-form, 05-admin-features, 06-responses, 07-analytics]

# Tech tracking
tech-stack:
  added:
    - shadcn/ui card, input, label components (base-nova style, @base-ui/react primitives)
  patterns:
    - unsealData approach for middleware JWT verification (not admin_jwt fallback cookie)
    - iron-session encrypted cookie stores the JWT string; middleware decrypts with unsealData then verifies with jose jwtVerify
    - Generic "Invalid credentials" error from both API (no enumeration) and client error message via i18n

key-files:
  created:
    - src/lib/auth.ts
    - src/app/api/auth/route.ts
    - src/middleware.ts
    - src/app/[locale]/login/page.tsx
    - src/app/[locale]/(admin)/layout.tsx
    - src/app/[locale]/(admin)/admin/page.tsx
    - src/app/[locale]/(admin)/admin/surveys/page.tsx
    - src/app/[locale]/(admin)/admin/settings/page.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/components/ui/card.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - __tests__/lib/auth.test.ts
  modified:
    - src/middleware.ts (replaced i18n-only stub with auth guard + next-intl routing)

key-decisions:
  - "Committed to unsealData approach: iron-session unsealData decrypts cookie in middleware, then jose jwtVerify cryptographically verifies JWT — grep unsealData in middleware.ts confirms"
  - "Login error message uses i18n: t('error') maps to 'Invalid credentials' in en.json — behavior identical, but text is now translatable for Burmese locale"
  - "Next.js 16 deprecates middleware.ts in favor of proxy.ts — kept middleware.ts since functionality is preserved (build shows Proxy Middleware), will rename in maintenance"

patterns-established:
  - "Pattern: Auth flow — POST /api/auth signs JWT with jose, stores in iron-session cookie; middleware unsealData + jwtVerify on every /admin request"
  - "Pattern: Generic auth errors — API returns 401 with 'Invalid credentials' (no field-specific errors to prevent enumeration)"
  - "Pattern: Admin route protection — middleware regex /\\/(?:en|my)\\/admin/ guards all admin routes automatically; new admin routes are protected without code changes"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, UIUX-01, UIUX-03]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 1 Plan 02: Admin Authentication Summary

**iron-session encrypted cookie + jose JWT cryptographic middleware guard for /admin routes, with centered card login page and collapsible admin shell sidebar using unsealData pattern (CVE-2025-29927 mitigation)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-01T14:48:53Z
- **Completed:** 2026-04-01T14:54:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Implemented admin auth gate: POST /api/auth signs a jose JWT (24h), stores it in iron-session encrypted cookie; DELETE /api/auth destroys session
- Middleware uses `unsealData` (iron-session) to decrypt cookie then `jwtVerify` (jose) to cryptographically verify JWT on every /[locale]/admin/* request — mitigates CVE-2025-29927
- Centered card login page with blue accent, inline error display (via i18n), POST fetch to /api/auth
- Collapsible admin shell sidebar with Dashboard/Surveys/Settings nav items, responsive hamburger on mobile, collapse-to-icons on desktop, logout button
- All 5 admin placeholder pages built and verified; npx next build exits 0 with all routes correct

## Task Commits

1. **Task 1 (TDD RED):** `b0b41bd` — `feat(01-02): implement auth helpers, API route (login + logout), and middleware`
2. **Task 2:** `1f66852` — `feat(01-02): login page, admin shell layout, and placeholder pages`
3. **Task 2 (i18n linter):** `1caa6c7` — `refactor(01-02): apply i18n translations to login page, admin sidebar, and dashboard`
4. **Task 2 (i18n linter):** `79777bb` — `refactor(01-02): apply i18n to surveys and settings placeholder pages`

## Files Created/Modified

- `src/lib/auth.ts` — SessionData interface + sessionOptions (cookieName: admin_session, maxAge: 86400)
- `src/app/api/auth/route.ts` — POST login (jose SignJWT HS256, iron-session save) + DELETE logout
- `src/middleware.ts` — next-intl routing + unsealData + jose jwtVerify guard for /[locale]/admin/*
- `src/app/[locale]/login/page.tsx` — Centered card login form, 'use client', inline error via i18n
- `src/components/admin/AdminSidebar.tsx` — Collapsible sidebar, mobileOpen state, md:hidden hamburger, hidden md:block desktop, handleLogout DELETE
- `src/app/[locale]/(admin)/layout.tsx` — Admin shell layout wrapping AdminSidebar
- `src/app/[locale]/(admin)/admin/page.tsx` — Dashboard with static onboarding checklist (3 steps)
- `src/app/[locale]/(admin)/admin/surveys/page.tsx` — Placeholder: Survey management coming Phase 2
- `src/app/[locale]/(admin)/admin/settings/page.tsx` — Placeholder: SMTP config coming Phase 2
- `src/components/ui/card.tsx` — shadcn card, CardHeader, CardTitle, CardDescription, CardContent
- `src/components/ui/input.tsx` — shadcn input (@base-ui/react/input primitive)
- `src/components/ui/label.tsx` — shadcn label
- `__tests__/lib/auth.test.ts` — 2 unit tests: cookieName === 'admin_session', maxAge === 86400

## Decisions Made

- **unsealData approach confirmed:** The plan specified `unsealData` as the committed pattern (not admin_jwt fallback cookie). Implemented exactly as specified — `grep "unsealData" src/middleware.ts` returns match.
- **Login error via i18n:** The plan had hardcoded `'Invalid credentials'` in the component. The project's linter automatically converted strings to i18n translations (`t('error')` resolves to `"Invalid credentials"` from `messages/en.json`). Behavior is identical; text is now also translatable for Burmese.
- **Next.js 16 middleware.ts deprecation:** Next.js 16 shows a warning that `middleware.ts` is deprecated in favor of `proxy.ts`. Functionality is preserved (build shows "Proxy (Middleware)"). Will rename to `proxy.ts` in a maintenance task.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created i18n/routing.ts which was already present**
- **Found during:** Task 1 (middleware creation)
- **Issue:** The middleware imports `./i18n/routing`. The plan didn't mention this file, but it already existed from the 01-01 plan execution (which created an i18n stub). No action needed.
- **Files modified:** None — file already existed
- **Verification:** `import { routing } from './i18n/routing'` resolves correctly in build

**2. [Rule 1 - Bug] Login page and admin components automatically i18n-ified by linter**
- **Found during:** Task 2 (linter ran after file creation)
- **Issue:** Plan specified hardcoded English strings; the project linter converted all user-facing strings to `useTranslations`/`getTranslations` calls pointing to `messages/en.json`
- **Fix:** Applied automatically. All strings exist in `messages/en.json` with identical content. Build verified passing.
- **Files modified:** `src/app/[locale]/login/page.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/app/[locale]/(admin)/admin/page.tsx`, `src/app/[locale]/(admin)/admin/surveys/page.tsx`, `src/app/[locale]/(admin)/admin/settings/page.tsx`
- **Verification:** `npx next build` exits 0; all 26 vitest tests pass
- **Committed in:** `1caa6c7`, `79777bb`

---

**Total deviations:** 2 (1 non-issue, 1 auto-fixed by linter)
**Impact on plan:** Linter improvements are beneficial — strings are now translatable for Burmese locale. No scope creep, behavior identical.

## Auth Pattern Confirmed

**Approach used:** `unsealData` path (iron-session v8)

- `grep "unsealData" src/middleware.ts` returns match
- `grep "jwtVerify" src/middleware.ts` returns match
- No admin_jwt fallback cookie implemented (as specified in plan)

## shadcn Components Installed

- `card` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction)
- `input` (Input with @base-ui/react/input primitive)
- `label` (Label)

All use base-nova style consistent with existing `button` component.

## Test Results

```
Test Files  5 passed (5)
      Tests  26 passed (26)
```

Build: `npx next build` exits 0. Routes: /[locale]/admin, /[locale]/admin/settings, /[locale]/admin/surveys, /[locale]/login, /api/auth all present.

## Issues Encountered

- `src/middleware.ts` already existed as an i18n-only stub from plan 01-01 (the stub said "01-02 auth plan will enhance this"). Overwrote it with the full implementation as planned.

## User Setup Required

Admin credentials must be set in `.env.local` before testing:
```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_JWT_SECRET=a-random-32-char-string-minimum
IRON_SESSION_PASSWORD=another-random-32-char-string-minimum
```

These keys are documented in `.env.example` (created in plan 01-01).

## Next Phase Readiness

- Plan 01-03 (i18n) can proceed — all admin routes already use `useTranslations`/`getTranslations`, ready for message file population
- All future admin routes under `/[locale]/(admin)/` are automatically protected by middleware without code changes
- Login flow is complete end-to-end: login → JWT signed → iron-session → middleware decrypts + verifies → admin dashboard

---
*Phase: 01-foundation*
*Completed: 2026-04-01*
