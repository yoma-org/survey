# Requirements: Surey Yoma

**Defined:** 2026-04-01
**Core Value:** Admins can distribute surveys to employees via unique email links and view comprehensive, multi-dimensional analytical dashboards from collected responses

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Project bootstrapped with Next.js 15 App Router, TypeScript, Tailwind CSS 4, shadcn/ui
- [x] **FOUN-02**: Vercel Blob StorageAdapter with ETag-based concurrent write protection and local fs fallback for dev
- [x] **FOUN-03**: CSV schema defined with explicit questionId columns and header-based read/write (not index-based)
- [x] **FOUN-04**: GPTW dimension constants mapping all 46 questions to dimensions and sub-pillars in lib/constants.ts
- [x] **FOUN-05**: URL-based i18n routing with next-intl (/en/... and /my/...) with Noto Sans Myanmar font loaded via Fontsource
- [x] **FOUN-06**: English and Burmese translation message files (messages/en.json and messages/mm.json) with all UI strings

### Authentication

- [x] **AUTH-01**: Admin can log in with static username/password credentials
- [x] **AUTH-02**: Admin session persists via iron-session encrypted cookies
- [x] **AUTH-03**: All /admin routes protected by middleware using jose JWT verification
- [x] **AUTH-04**: Admin can log out and session is destroyed

### Survey Management

- [x] **SURV-01**: Admin can create a new survey with name and description
- [x] **SURV-02**: Admin can upload bilingual question list from Excel file (exceljs parser)
- [x] **SURV-03**: Survey questions support Likert scale (5-point), open-ended text, and demographic select types
- [x] **SURV-04**: Survey questions stored with both English and Burmese text
- [x] **SURV-05**: Survey organized into sections matching GPTW dimensions (Camaraderie, Credibility, Fairness, Pride, Respect) plus demographics and open-ended
- [x] **SURV-06**: Admin can view list of all surveys with status

### Email Distribution

- [x] **EMAL-01**: Admin can configure SMTP server settings (host, port, username, password, from address) via settings page
- [x] **EMAL-02**: SMTP onboarding modal prompts admin to configure email before first use
- [x] **EMAL-03**: Admin can send test email to verify SMTP configuration
- [x] **EMAL-04**: Admin can input employee email addresses and select a survey to distribute
- [x] **EMAL-05**: System generates cryptographically secure unique token per employee-survey pair (crypto.randomBytes)
- [x] **EMAL-06**: Admin can send professional, friendly invitation emails with survey name and unique link via SMTP
- [x] **EMAL-07**: Email template renders correctly with survey name and personalized link

### Survey Form

- [x] **FORM-01**: Employee accesses survey via unique URL with token; email pre-filled from token lookup
- [x] **FORM-02**: Survey form displays in multi-section layout with floating TOC on left side
- [x] **FORM-03**: Floating TOC tracks progress showing completed/remaining sections
- [x] **FORM-04**: Survey renders in selected language (English or Burmese) with language switcher
- [x] **FORM-05**: Likert scale questions display 5 options (Strongly Disagree to Strongly Agree) in selected language
- [x] **FORM-06**: Open-ended questions provide text area input
- [x] **FORM-07**: Demographic section collects Organization, Service Year, and Role Type with predefined options in both languages
- [x] **FORM-08**: Form validation with inline error messages, guidelines, and tooltips
- [x] **FORM-09**: Confirmation dialog shown before final submission
- [x] **FORM-10**: Token marked as used server-side upon submission (prevents resubmission)
- [x] **FORM-11**: Responses persisted to CSV file partitioned by survey ID
- [x] **FORM-12**: Basic information fields (name, department) available as optional inputs

### Analytics Dashboard

- [ ] **DASH-01**: Admin dashboard page showing overall Employee Engagement Score (EES) as percentage favorable
- [ ] **DASH-02**: Pie/donut chart showing Positive/Neutral/Negative response distribution
- [ ] **DASH-03**: Bar chart showing 5 key dimension scores (Credibility, Respect, Fairness, Pride, Camaraderie) as % favorable
- [ ] **DASH-04**: ENPS (Employee Net Promoter Score) visualization as gauge/infographic
- [ ] **DASH-05**: Top 10 Strengths (highest scoring statements) as horizontal bar chart
- [ ] **DASH-06**: Bottom 10 Opportunities (lowest scoring statements) as horizontal bar chart
- [ ] **DASH-07**: Department/organization breakdown charts showing dimension scores per group
- [ ] **DASH-08**: Leaderboard metrics showing % Completion, % Credibility, % Respect, % Fairness, % Pride, % Camaraderie, % Overall Satisfaction, % ENPS, % Engagement, % Innovation, % Leadership
- [ ] **DASH-09**: Charts use Chart.js with proper client-side rendering (use client + dynamic import with ssr:false)
- [ ] **DASH-10**: Chart components use IntersectionObserver for lazy instantiation and proper useEffect cleanup to prevent memory leaks
- [ ] **DASH-11**: Analytics data aggregated server-side and passed as props to client chart components
- [ ] **DASH-12**: Admin can filter/view charts by survey selection

### UI/UX

- [x] **UIUX-01**: Clean, white, simple design with easily readable fonts
- [ ] **UIUX-02**: Subtle background animation effects for UX enhancement
- [x] **UIUX-03**: Responsive layout working on desktop and mobile browsers
- [x] **UIUX-04**: All user-facing text available in both English and Burmese

### Data & Storage

- [x] **DATA-01**: All survey responses persisted to CSV files
- [x] **DATA-02**: CSV files stored via Vercel Blob in production with local filesystem fallback for development
- [x] **DATA-03**: Survey configuration, tokens, SMTP settings, and responses each stored in separate CSV files
- [ ] **DATA-04**: Anonymity threshold enforced — segment breakdowns hidden when response count < 5

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Analytics

- **EANA-01**: Deep-dive sub-pillar charts per dimension (e.g., Credibility → Communication, Competence, Integrity)
- **EANA-02**: Radar/spider chart overlaying all 5 dimension scores
- **EANA-03**: Key relationship analysis charts (Employee/Engagement, Job/Innovation, Management/Leadership)
- **EANA-04**: Gap analysis chart comparing Manager vs Individual Contributor perception
- **EANA-05**: Year-over-year comparison charts (requires multiple survey periods)
- **EANA-06**: Internal benchmark trend lines across survey periods
- **EANA-07**: Sentiment word cloud from open-ended question responses
- **EANA-08**: Heat map showing statement scores by department/team
- **EANA-09**: Distribution histogram showing response spread per statement

### Enhanced UX

- **EUXP-01**: Animated chart transitions using Motion library
- **EUXP-02**: Industry/external benchmark comparison charts
- **EUXP-03**: AI-generated focus area recommendations from survey data

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| OAuth/SSO authentication | Static credentials sufficient for single-admin MVP |
| Database backend (PostgreSQL, etc.) | CSV storage is a deliberate constraint per requirements |
| Real-time analytics during collection | Creates anchoring bias; show results only after survey closes |
| Individual response identification | Destroys psychological safety; anonymity is non-negotiable |
| Mobile native app | Responsive web design sufficient; native adds codebase overhead |
| Multi-tenant support | Single organization deployment; use demographic field for org segmentation |
| Recurring/scheduled survey automation | Manual distribution workflow per requirements |
| Pulse surveys / weekly check-ins | Annual culture survey cadence, not continuous listening |
| Real-time chat or collaboration | Not relevant to survey use case |
| Payment processing | No paid features in scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| SURV-01 | Phase 2 | Complete |
| SURV-02 | Phase 2 | Complete |
| SURV-03 | Phase 2 | Complete |
| SURV-04 | Phase 2 | Complete |
| SURV-05 | Phase 2 | Complete |
| SURV-06 | Phase 2 | Complete |
| EMAL-01 | Phase 2 | Complete |
| EMAL-02 | Phase 2 | Complete |
| EMAL-03 | Phase 2 | Complete |
| EMAL-04 | Phase 2 | Complete |
| EMAL-05 | Phase 2 | Complete |
| EMAL-06 | Phase 2 | Complete |
| EMAL-07 | Phase 2 | Complete |
| FORM-01 | Phase 3 | Complete |
| FORM-02 | Phase 3 | Complete |
| FORM-03 | Phase 3 | Complete |
| FORM-04 | Phase 3 | Complete |
| FORM-05 | Phase 3 | Complete |
| FORM-06 | Phase 3 | Complete |
| FORM-07 | Phase 3 | Complete |
| FORM-08 | Phase 3 | Complete |
| FORM-09 | Phase 3 | Complete |
| FORM-10 | Phase 3 | Complete |
| FORM-11 | Phase 3 | Complete |
| FORM-12 | Phase 3 | Complete |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| DASH-05 | Phase 4 | Pending |
| DASH-06 | Phase 4 | Pending |
| DASH-07 | Phase 4 | Pending |
| DASH-08 | Phase 4 | Pending |
| DASH-09 | Phase 4 | Pending |
| DASH-10 | Phase 4 | Pending |
| DASH-11 | Phase 4 | Pending |
| DASH-12 | Phase 4 | Pending |
| UIUX-01 | Phase 1 | Complete |
| UIUX-02 | Phase 4 | Pending |
| UIUX-03 | Phase 1 | Complete |
| UIUX-04 | Phase 1 | Complete |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after roadmap creation*
