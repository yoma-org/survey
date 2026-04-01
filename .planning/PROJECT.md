# Survey Yoma — Employee Culture Survey Platform

## What This Is

A bilingual (English/Burmese) employee culture survey platform for organizations like Yoma Bank and Wave Money. Admins create and distribute surveys via unique email links, employees complete Google Form-style surveys, and admins analyze results through animated, multi-dimensional Chart.js dashboards. Built with Next.js, data persists to CSV files with optional Vercel storage sync.

## Core Value

Admins can distribute surveys to employees via unique email links and view comprehensive, multi-dimensional analytical dashboards from collected responses — the complete survey-to-insight pipeline must work end-to-end.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Admin authentication with static username/password
- [ ] Admin can create surveys and upload bilingual question lists from Excel
- [ ] Admin can input employee emails, select survey, generate unique links, and send via SMTP
- [ ] Admin SMTP settings configuration with onboarding modal
- [ ] Survey form accessible via unique URL with email pre-filled from link
- [ ] Survey with multiple input types, multi-section layout, floating TOC with progress tracking
- [ ] Confirmation dialog after survey completion
- [ ] 5-point Likert scale scoring (Strongly Disagree to Strongly Agree)
- [ ] Open-ended text questions support
- [ ] Demographic data collection (organization, service year, role type)
- [ ] Admin dashboard with multi-dimensional charts (Credibility, Respect, Fairness, Pride, Camaraderie)
- [ ] Deep-dive charts per dimension (sub-pillars like Communication, Competence, Integrity under Credibility)
- [ ] Key relationship charts (Employee, Job, Management)
- [ ] Year-over-year comparison and internal benchmarking charts
- [ ] Top/Bottom statement rankings (Strengths & Opportunities)
- [ ] ENPS (Employee Net Promoter Score) visualization
- [ ] Department/team-wise breakdowns
- [ ] Leaderboard metrics (% Completion, % Credibility, % Respect, % Fairness, % Pride, % Camaraderie)
- [ ] i18n support for English and Burmese (Myanmar language)
- [ ] Questions available in both languages from PDF data source
- [ ] Professional, friendly email templates with survey name
- [ ] Data persistence to CSV files with Vercel storage sync support
- [ ] Clean, white, simple UI with readable fonts
- [ ] Background animation effects for UX enhancement
- [ ] Form validation with guidelines and tooltips

### Out of Scope

- OAuth/SSO authentication — static credentials sufficient for admin MVP
- Real-time collaboration — single admin use case
- Database backend (PostgreSQL, etc.) — CSV-based storage per requirements
- Mobile native app — web-responsive is sufficient
- Multi-tenant support — single organization deployment
- Automated survey scheduling/recurring — manual distribution only

## Context

**Survey Structure (from YFS Culture Survey March 2026):**
- 46 scored statements + 1 uncategorized + 2 open-ended questions
- 5 key dimensions: Camaraderie (Q1-8), Credibility (Q9-17), Fairness (Q18-25), Pride (Q26-35), Respect (Q36-46)
- Each dimension has sub-pillars (e.g., Credibility → Communication, Competence, Integrity)
- 3 key relationships measured: Employee (Engagement), Job (Innovation), Management (Leadership Behavior)
- Demographic sections: Organization (Wave Money/Yoma Bank), Service Year (6 ranges), Role Type (Individual/Manager)
- All statements bilingual: English + Burmese (Myanmar script)

**Chart Types Needed (from 2023 Employee Survey ODP):**
1. Annual EES Score — bar chart (year-over-year comparison)
2. EES Score Overview — pie/donut chart (Positive/Neutral/Negative split)
3. Great Place to Work Statement — bar chart with pie
4. 5 Key Dimensions by favorable % — grouped bar chart
5. Deep Dive per Dimension (Credibility, Respect, Fairness, Pride, Camaraderie) — grouped bar with sub-pillars
6. Key Relationship Results (Employee, Job, Management) — horizontal stacked bar
7. Confidence in Leadership — stacked bar
8. PX Statements (Work-Life Balance, Campus Facility) — horizontal bar
9. ENPS (Employee Net Promoter Score) — gauge/infographic
10. Top 10 Strengths / Bottom 10 Opportunities — horizontal bar rankings
11. Department-wise Key Dimensions — grouped bar by department
12. Team-wise breakdown — table/heatmap with scores
13. Internal Benchmark (year-over-year) — line/bar comparison
14. Industry/External Benchmark — grouped bar comparison
15. Sentiment Analysis on open-ended questions — word cloud or category chart

**Additional Recommended Charts:**
16. Response Rate Tracker — progress bar/gauge per survey
17. Dimension Radar/Spider Chart — overlay all 5 dimensions
18. Trend Lines — dimension scores over multiple survey periods
19. Heat Map — statement scores by department/team
20. Distribution Histogram — response distribution per statement
21. Gap Analysis Chart — Manager vs Individual Contributor perception gaps

**Leaderboard Metrics:**
- % Completion (survey response rate)
- % Credibility, % Respect, % Fairness, % Pride, % Camaraderie (dimension scores)
- % Overall Satisfaction (GPTW statement)
- % ENPS (Net Promoter Score)
- % Engagement (Employee relationship)
- % Innovation (Job relationship)
- % Leadership (Management relationship)

## Constraints

- **Tech Stack**: Next.js + Chart.js — specified by user
- **Storage**: CSV files (with Vercel storage sync) — no database
- **Language**: Bilingual English + Burmese — all user-facing text
- **Auth**: Static admin credentials — no user management system
- **Email**: SMTP-based — admin configures their own SMTP server
- **Data Source**: Initial questions from YFS Culture Survey PDF (46 statements + demographics)
- **UI**: Clean, white, simple design with animations — not heavy/corporate

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js as framework | User specified, good for SSR + API routes + Vercel deployment | — Pending |
| Chart.js for visualizations | User specified, lightweight, good animation support | — Pending |
| CSV file storage over database | User requirement, simpler deployment, Vercel storage compatible | — Pending |
| Static admin auth | MVP simplicity, single-admin use case | — Pending |
| Bilingual from day one | Core requirement for Burmese employees, not a retrofit | — Pending |
| Google Form-style survey UX | User specified, familiar pattern for employees | — Pending |

---
*Last updated: 2026-04-01 after initialization*
