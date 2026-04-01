---
phase: 02-survey-creation-and-distribution
plan: 01
subsystem: survey-management
tags: [survey, excel-import, csv, api, admin-ui, i18n, tdd]
dependency_graph:
  requires:
    - 01-01 (StorageAdapter, csv.service, types.ts, auth.ts, iron-session pattern)
  provides:
    - survey.service.ts (createSurvey, listSurveys, getSurvey, saveQuestions, getQuestions, getResponseCount)
    - excel.service.ts (parseExcelBuffer)
    - GET+POST /api/surveys
    - GET /api/surveys/[id]
    - POST /api/surveys/[id]/questions (Excel import)
    - Admin survey list, create, and detail pages
    - writeRows() in csv.service.ts
    - SmtpSettings type in types.ts
  affects:
    - 02-02 (depends on survey IDs; SMTP service uses writeRows; token/email services need survey context)
tech_stack:
  added:
    - exceljs (Excel buffer parsing — no CVE risk unlike xlsx)
    - nodemailer + @types/nodemailer (prepared for Plan 02-02 email service)
    - sonner (toast library — installed, used in Plan 02-02)
    - shadcn: badge, select, textarea, alert, progress, dialog
  patterns:
    - TDD RED→GREEN on excel.service.ts and survey.service.ts
    - vi.mock('@/lib/services/csv.service') for survey service unit tests
    - ExcelJS workbook.xlsx.load(buffer) + eachRow with 1-indexed slice(1)
    - iron-session auth guard helper (isAuthenticated()) in each API route
    - buttonVariants+Link instead of Button asChild (base-ui Button has no asChild)
    - params: Promise<{id, locale}> pattern for Next.js 16 async params
key_files:
  created:
    - src/lib/services/excel.service.ts
    - src/lib/services/survey.service.ts
    - src/app/api/surveys/route.ts
    - src/app/api/surveys/[id]/route.ts
    - src/app/api/surveys/[id]/questions/route.ts
    - src/app/[locale]/(admin)/admin/surveys/new/page.tsx
    - src/app/[locale]/(admin)/admin/surveys/[id]/page.tsx
    - src/components/admin/SurveyCreateForm.tsx
    - src/components/admin/ExcelUploadStep.tsx
    - __tests__/services/survey.service.test.ts
    - __tests__/services/excel.service.test.ts
    - __tests__/services/token.service.test.ts
    - __tests__/services/email.service.test.ts
    - __tests__/services/smtp.service.test.ts
  modified:
    - src/lib/services/csv.service.ts (added writeRows)
    - src/lib/types.ts (added SmtpSettings)
    - src/app/[locale]/(admin)/admin/surveys/page.tsx (replaced stub with real list)
    - messages/en.json (35 new surveys.* keys)
    - messages/mm.json (35 new surveys.* Burmese translations)
    - src/components/ui/badge.tsx (new shadcn component)
    - src/components/ui/select.tsx (new shadcn component)
    - src/components/ui/textarea.tsx (new shadcn component)
    - src/components/ui/alert.tsx (new shadcn component)
    - src/components/ui/progress.tsx (new shadcn component)
    - src/components/ui/dialog.tsx (new shadcn component)
decisions:
  - "Button asChild not available — base-ui Button has no asChild prop; use buttonVariants + Link"
  - "ExcelJS Buffer type cast via unknown — Node 22 Buffer<ArrayBufferLike> differs from ExcelJS expected Buffer type"
  - "Survey type cast via unknown as Record<string,string> — Survey interface lacks index signature required by readRows generic"
  - "New survey page uses use client — useSearchParams for step=2 URL param requires client component"
metrics:
  duration: "9 min"
  completed: "2026-04-01"
  tasks: 3
  files: 26
---

# Phase 02 Plan 01: Survey CRUD, Excel Import, and Admin Pages Summary

**One-liner:** Survey management backbone — exceljs import pipeline, CSV-backed CRUD service, auth-guarded API routes, two-step admin creation flow, bilingual question preview.

## Tasks Completed

| # | Task | Commit | Key Deliverables |
|---|------|--------|------------------|
| 1 | Dependencies, writeRows, SmtpSettings, Wave 0 test stubs | 4bea3f2 | writeRows in csv.service.ts, SmtpSettings in types.ts, 5 stub test files, 6 shadcn components |
| 2 | excel.service, survey.service, API routes | 8ba99c0 | parseExcelBuffer with real tests, 6 survey CRUD functions, 3 auth-guarded API routes |
| 3 | Survey pages, SurveyCreateForm, ExcelUploadStep, i18n | 24528ce | List/create/detail pages, drag-drop upload component, 35 bilingual translation keys |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button asChild prop not available in base-ui Button**
- **Found during:** Task 3
- **Issue:** `<Button asChild>` caused TS2322 — base-ui `ButtonPrimitive` has no `asChild` prop unlike shadcn Radix-based Button
- **Fix:** Replaced all `<Button asChild><Link>` patterns with `<Link className={cn(buttonVariants({...}))}>`
- **Files modified:** surveys/page.tsx, surveys/[id]/page.tsx
- **Commit:** 24528ce (included in Task 3 commit)

**2. [Rule 1 - Bug] TypeScript Buffer type mismatch for ExcelJS**
- **Found during:** Task 2
- **Issue:** TS2345 — Node 22's `Buffer<ArrayBufferLike>` not assignable to ExcelJS's `Buffer` type
- **Fix:** `buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]` cast
- **Files modified:** src/lib/services/excel.service.ts
- **Commit:** 8ba99c0

**3. [Rule 1 - Bug] Survey type does not satisfy Record<string,string> constraint**
- **Found during:** Task 2
- **Issue:** TS2344/TS2352 — `Survey` interface lacks index signature; `readRows<Survey>` fails TypeScript
- **Fix:** Read as `Record<string,string>` then cast to `unknown as Survey[]`
- **Files modified:** src/lib/services/survey.service.ts
- **Commit:** 8ba99c0

## Verification Results

```
npx vitest run: 35 passed | 5 todo (no failures)
npx tsc --noEmit: exit 0 (zero errors)
```

All plan acceptance criteria confirmed:
- writeRows in csv.service.ts
- SmtpSettings in types.ts
- parseExcelBuffer in excel.service.ts
- getResponseCount in survey.service.ts
- All 3 API routes exist with auth guards
- Both new survey pages exist
- responseCount key in both en.json and mm.json
- statusDraft/statusActive/statusClosed in both locales

## Self-Check: PASSED

All 9 key files confirmed present. All 3 task commits confirmed in git log (4bea3f2, 8ba99c0, 24528ce).
