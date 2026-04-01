---
phase: 01-foundation
plan: 03
subsystem: ui
tags: [next-intl, i18n, myanmar, burmese, noto-sans-myanmar, locale-routing, translations]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: "Next.js scaffold, next.config.ts with next-intl plugin, src/i18n/request.ts stub"
  - phase: 01-foundation/01-02
    provides: "login/page.tsx, AdminSidebar.tsx, admin/page.tsx, surveys/page.tsx, settings/page.tsx"
provides:
  - "next-intl URL-path routing with locales ['en','my'] and defaultLocale 'en'"
  - "messages/en.json + messages/mm.json with 40 Phase 1 UI strings across 7 sections"
  - "LanguageSwitcher component in locale layout header (fixed top-right)"
  - "Noto Sans Myanmar Variable font loaded on /my locale via font-myanmar CSS class"
  - "i18n key naming convention: {section}.{key} (login, nav, dashboard, surveys, settings, common, errors)"
  - "All Phase 1 UI components use useTranslations/getTranslations — zero hardcoded strings"
affects:
  - phases 02-04 routes (inherit [locale] URL structure)
  - all future components (must use useTranslations/getTranslations)
  - translation keys (establish naming convention for Phase 2+)

# Tech tracking
tech-stack:
  added:
    - "@fontsource-variable/noto-sans-myanmar: ^5.2.1 (Myanmar font, conditional on locale)"
    - "next-intl: ^4.8.4 (URL-path i18n routing and translation provider)"
  patterns:
    - "URL-path locale routing: all routes under /[locale]/ — locked for all phases"
    - "Server components use getTranslations(), client components use useTranslations()"
    - "Locale layout handles <html lang> and <body> font class (root layout is passthrough)"
    - "localeDetection: false — URL path only, no Accept-Language header"

key-files:
  created:
    - "src/i18n/routing.ts - defineRouting with locales ['en','my'], defaultLocale 'en', localeDetection false"
    - "src/app/[locale]/layout.tsx - locale layout with NextIntlClientProvider, font-myanmar conditional, LanguageSwitcher"
    - "src/components/LanguageSwitcher.tsx - client component, locale toggle button (top-right fixed)"
    - "messages/en.json - 40 English UI strings across login/nav/dashboard/surveys/settings/common/errors"
    - "messages/mm.json - 40 Burmese UI strings mirroring en.json structure"
    - "__tests__/lib/i18n.test.ts - 8 tests verifying routing config and message structure"
    - "src/middleware.ts - next-intl createMiddleware(routing) + JWT auth guard for /admin routes"
  modified:
    - "src/i18n/request.ts - full getRequestConfig implementation (replaces 01-01 stub)"
    - "src/app/layout.tsx - simplified to passthrough (locale layout handles html/body)"
    - "src/app/globals.css - added .font-myanmar CSS class"
    - "src/app/[locale]/login/page.tsx - useTranslations('login') replaces all hardcoded strings"
    - "src/components/admin/AdminSidebar.tsx - useTranslations('nav') replaces all hardcoded nav strings"
    - "src/app/[locale]/(admin)/admin/page.tsx - getTranslations('dashboard') replaces hardcoded strings"
    - "src/app/[locale]/(admin)/admin/settings/page.tsx - getTranslations('settings') added"
    - "src/app/[locale]/(admin)/admin/surveys/page.tsx - getTranslations('surveys') added"
    - "src/lib/auth.ts - fixed IronSessionData -> plain interface (iron-session v3 compatibility)"

key-decisions:
  - "localeDetection: false — URL path only, prevents SSR hydration mismatch from browser locale negotiation"
  - "Root layout is passthrough only — locale layout exclusively handles html/body to avoid nested html tags"
  - "LanguageSwitcher uses pathname.replace() for locale switching — preserves deep link paths (e.g. /en/admin/surveys -> /my/admin/surveys)"
  - "Server components use getTranslations(), client components use useTranslations() — established for all phases"
  - "messages/ directory at project root (not src/) — matches next-intl import pattern via dynamic import()"

patterns-established:
  - "Translation key naming: {section}.{key} — login.title, nav.dashboard, errors.invalidCredentials etc."
  - "All UI strings must live in messages/en.json and messages/mm.json — no hardcoded JSX strings"
  - "New sections need both en.json and mm.json keys simultaneously to avoid missing translation runtime errors"
  - "Client component i18n: useTranslations() at top of component; Server component i18n: await getTranslations() in async function body"

requirements-completed: [FOUN-05, FOUN-06, UIUX-04]

# Metrics
duration: 8min
completed: 2026-04-01
---

# Phase 01 Plan 03: Bilingual i18n Infrastructure Summary

**next-intl URL-path bilingual routing (/en, /my) with Noto Sans Myanmar Variable font, 40-string translation files, and LanguageSwitcher component — all Phase 1 components use translations, zero hardcoded UI strings**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-01T07:48:51Z
- **Completed:** 2026-04-01T07:56:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- next-intl URL-path locale routing locked for all phases: /en/* and /my/* with defaultLocale 'en', localeDetection false
- messages/en.json + messages/mm.json with 40 strings each (7 sections: login, nav, dashboard, surveys, settings, common, errors)
- Noto Sans Myanmar Variable font conditionally applied via font-myanmar CSS class when locale is 'my'
- LanguageSwitcher component (client-side, fixed top-right) toggles between EN/MY while preserving current path
- All 6 Phase 1 UI components updated to use next-intl translations — zero hardcoded English strings in JSX

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure next-intl routing, request config, and root/locale layouts** - `fadca65` (feat)
2. **Task 2: Create translation files and LanguageSwitcher, update all components** - `5bdf817` (feat)

**Plan metadata:** (included in final docs commit)

## Files Created/Modified

- `src/i18n/routing.ts` - defineRouting config with locales, defaultLocale, localeDetection false
- `src/i18n/request.ts` - full getRequestConfig loading messages per locale (replaces stub)
- `src/app/layout.tsx` - simplified to passthrough (locale layout handles html/body)
- `src/app/[locale]/layout.tsx` - NextIntlClientProvider + font-myanmar conditional + LanguageSwitcher mount
- `src/app/globals.css` - .font-myanmar CSS class added
- `src/middleware.ts` - createMiddleware(routing) for i18n + JWT auth guard for /admin
- `messages/en.json` - 40 English UI strings across 7 sections
- `messages/mm.json` - 40 Burmese UI strings mirroring en.json structure
- `src/components/LanguageSwitcher.tsx` - client toggle button, preserves path on locale switch
- `src/app/[locale]/login/page.tsx` - useTranslations('login') for all login form strings
- `src/components/admin/AdminSidebar.tsx` - useTranslations('nav') for brand, nav labels, aria-labels
- `src/app/[locale]/(admin)/admin/page.tsx` - getTranslations('dashboard') for heading and checklist
- `src/app/[locale]/(admin)/admin/settings/page.tsx` - getTranslations('settings') added
- `src/app/[locale]/(admin)/admin/surveys/page.tsx` - getTranslations('surveys') added
- `src/lib/auth.ts` - removed IronSessionData import (incompatible with iron-session v3)
- `__tests__/lib/i18n.test.ts` - 8 tests for routing config and message structure

## Decisions Made

- `localeDetection: false` — URL path only, prevents SSR hydration mismatch from browser language negotiation
- Root layout is passthrough — prevents nested `<html>` tags that break hydration
- LanguageSwitcher uses `pathname.replace(/^\/(en|my)/, ...)` — preserves deep links across locale switch
- Server components: `await getTranslations()`, client components: `useTranslations()` — established pattern for all future phases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed auth.ts IronSessionData type incompatibility**
- **Found during:** Task 1 (build verification)
- **Issue:** `IronSessionData` imported from 'iron-session' does not exist in iron-session v3; only `IronSession<T>` generic type exists
- **Fix:** Replaced `interface SessionData extends IronSessionData` with plain `interface SessionData { token?: string }`
- **Files modified:** src/lib/auth.ts
- **Verification:** Build passed after fix (npx next build exits 0)
- **Committed in:** fadca65 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added translations for settings/page.tsx and surveys/page.tsx**
- **Found during:** Task 2 (hardcoded string audit)
- **Issue:** Settings and Surveys placeholder pages had hardcoded "Settings", "Surveys", and coming-soon text not covered by plan's explicit task scope
- **Fix:** Updated both files to use getTranslations() with existing 'settings' and 'surveys' sections in message files
- **Files modified:** src/app/[locale]/(admin)/admin/settings/page.tsx, src/app/[locale]/(admin)/admin/surveys/page.tsx
- **Verification:** grep finds no hardcoded UI strings; build exits 0
- **Committed in:** 5bdf817 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes necessary for correctness. Auth fix was a pre-existing type error from 01-02. Settings/surveys fix completes UIUX-04 requirement (no hardcoded strings). No scope creep.

## Issues Encountered

- The middleware.ts was created as a minimal i18n-only version, but the linter/environment automatically enhanced it with the full JWT auth guard pattern from the 01-02 research. The enhanced version imports iron-session's `unsealData` and correctly guards `/admin` routes — accepted as the correct final form.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- i18n routing is locked and ready: all Phase 2-4 routes will automatically be under /[locale]/
- Translation key convention established: future plans must add both en.json and mm.json entries simultaneously
- LanguageSwitcher mounted globally in locale layout — visible on all pages without per-page setup
- No blockers for Phase 2 auth/API work

---
*Phase: 01-foundation*
*Completed: 2026-04-01*
