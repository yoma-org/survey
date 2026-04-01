# Roadmap: Surey Yoma

## Overview

Four phases that deliver the complete survey-to-insight pipeline. Phase 1 establishes the non-retroactive foundation (data model, storage, auth, i18n routing) — nothing else can be built safely without it. Phase 2 wires the admin-side survey creation and email distribution pipeline. Phase 3 delivers the employee-facing bilingual survey form and response collection. Phase 4 turns collected responses into the multi-dimensional Chart.js analytics dashboard that is the core product value.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Data model, storage adapter, auth, i18n routing — the non-retroactive infrastructure everything else depends on (completed 2026-04-01)
- [x] **Phase 2: Survey Creation and Distribution** - Admin creates surveys, imports bilingual questions, configures SMTP, and sends unique invitation emails to employees (completed 2026-04-01)
- [x] **Phase 3: Employee Survey Form** - Employees access surveys via unique links, complete the bilingual multi-section form, and responses are persisted to CSV (completed 2026-04-01)
- [x] **Phase 4: Analytics Dashboard** - Admin views multi-dimensional Chart.js dashboards with GPTW scoring, ENPS, leaderboard, and department breakdowns derived from collected responses (completed 2026-04-01)

## Phase Details

### Phase 1: Foundation
**Goal**: A deployable Next.js shell exists with working auth, bilingual routing, and a production-safe CSV storage layer — every downstream feature has a stable platform to build on
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, AUTH-01, AUTH-02, AUTH-03, AUTH-04, UIUX-01, UIUX-03, UIUX-04, DATA-02
**Success Criteria** (what must be TRUE):
  1. Admin can log in with static credentials, access protected /admin routes, and log out — session persists across page reloads
  2. Visiting /en and /my routes renders the correct language without hydration errors or visible flash
  3. CSV read/write operations work in both local dev (filesystem) and Vercel production (Blob storage with ETag retry)
  4. The GPTW question-to-dimension constants are defined in lib/constants.ts covering all 46 questions mapped to their 5 dimensions and sub-pillars
  5. The application is deployable to Vercel preview with all routes returning non-500 responses
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, TypeScript types, GPTW constants, and StorageAdapter with CSV service
- [ ] 01-02-PLAN.md — Admin authentication (iron-session + jose JWT), middleware guard, login page, admin shell
- [ ] 01-03-PLAN.md — next-intl i18n routing, English/Burmese translation files, Noto Sans Myanmar font, LanguageSwitcher

### Phase 2: Survey Creation and Distribution
**Goal**: Admin can create surveys with bilingual questions, configure SMTP with a working test-send, and deliver unique personalized invitation emails to a list of employee email addresses
**Depends on**: Phase 1
**Requirements**: SURV-01, SURV-02, SURV-03, SURV-04, SURV-05, SURV-06, EMAL-01, EMAL-02, EMAL-03, EMAL-04, EMAL-05, EMAL-06, EMAL-07, DATA-01, DATA-03
**Success Criteria** (what must be TRUE):
  1. Admin can create a new survey, upload an Excel file with bilingual questions, and see the survey listed with Likert, open-ended, and demographic question types
  2. Admin is prompted to configure SMTP on first use and can send a test email that confirms delivery or surfaces a readable error
  3. Admin can paste a list of employee emails, select a survey, and send invitation emails — each employee receives a unique link with their email pre-filled
  4. Survey data, tokens, and SMTP settings are each stored in separate CSV files (not one combined file)
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Survey CRUD, exceljs import, question storage, survey list/create/detail pages
- [ ] 02-02-PLAN.md — SMTP settings, token generation, email distribution with onboarding modal and progress feedback

### Phase 3: Employee Survey Form
**Goal**: Employees can access their unique survey URL, complete the bilingual multi-section Likert form with open-ended and demographic questions, and submit — responses are persisted and the token is invalidated
**Depends on**: Phase 2
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09, FORM-10, FORM-11, FORM-12
**Success Criteria** (what must be TRUE):
  1. Employee opens their unique survey link and sees the form with their email pre-filled; the same link returns an error after submission (token invalidated)
  2. The form displays all sections in either English or Burmese based on the URL locale, with a language switcher that toggles all question text
  3. Floating TOC on the left shows section completion progress as the employee fills in the form
  4. Submitting the form shows a confirmation dialog, and the response is written to the correct survey's CSV file with all question IDs preserved
  5. Validation errors appear inline with helpful messages before the form can be submitted
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Token service extensions (findTokenByValue + markTokenUsed), validateAnswers, submit API, and i18n keys
- [ ] 03-02-PLAN.md — Survey page route, all form components (Likert, TOC, mobile bar, confirmation dialog, thank-you screen)

### Phase 4: Analytics Dashboard
**Goal**: Admin can select a survey and view a full recharts dashboard with GPTW dimension scores, ENPS gauge, Top 10/Bottom 10 statement rankings, department breakdowns, and leaderboard metrics — all computed server-side from collected CSV responses
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, DASH-11, DASH-12, UIUX-02, DATA-04
**Success Criteria** (what must be TRUE):
  1. Admin can select a survey and see the overall EES score, a donut chart for Positive/Neutral/Negative split, and a bar chart showing all 5 GPTW dimension scores as % favorable
  2. ENPS gauge displays the Employee Net Promoter Score and Top 10 Strengths / Bottom 10 Opportunities are visible as horizontal bar charts
  3. Department/organization breakdown charts show dimension scores segmented by demographic group; segments with fewer than 5 responses are hidden
  4. Leaderboard metrics table shows % Completion, all 5 dimension scores, % Overall Satisfaction, % ENPS, % Engagement, % Innovation, and % Leadership at a glance
  5. All charts render without errors or memory leaks across a full dashboard page load; background animation is present without degrading chart performance
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Analytics types, computeAnalytics service, countSurveyTokens, and SurveySelector component
- [ ] 04-02-PLAN.md — DepartmentBreakdownChart, DashboardCharts wiring, admin page rewrite with real data

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete    | 2026-04-01 |
| 2. Survey Creation and Distribution | 1/2 | Complete    | 2026-04-01 |
| 3. Employee Survey Form | 1/2 | Complete    | 2026-04-01 |
| 4. Analytics Dashboard | 2/2 | Complete    | 2026-04-01 |
