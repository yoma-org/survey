# Feature Research

**Domain:** Employee Culture Survey Platform
**Researched:** 2026-04-01
**Confidence:** HIGH (core survey features), MEDIUM (differentiator classification), HIGH (Great Place to Work Trust Index dimensions)

## Feature Landscape

### Table Stakes (Users Expect These)

Features admins and employees assume exist. Missing these = platform feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Survey creation with question types | Every survey tool has this; baseline capability | MEDIUM | Likert scale (5-point), open-ended text, demographic selects are the three types needed for GPTW-style surveys |
| Multi-section survey layout | Long surveys (46+ statements) require sections for cognitive grouping; users abandon linear walls of questions | MEDIUM | Floating TOC + progress bar is the standard pattern (Google Forms, SurveyMonkey) |
| Unique-link email distribution | Tied to response tracking and anonymity; industry standard since Qualtrics popularized it | MEDIUM | One unique URL per employee; pre-fills email identity without exposing it in the form |
| Response tracking per recipient | Admins need to know who hasn't responded to send reminders; without this, response rates collapse | MEDIUM | Track status: not started / in progress / completed — not the actual responses |
| Anonymous response collection | Employees won't answer honestly if they fear identification; foundational trust requirement | MEDIUM | Anonymity threshold (minimum N responses before showing breakdowns) protects individuals |
| Admin dashboard with aggregate results | The entire purpose of the platform — without analysis views, survey data is just raw CSV | HIGH | Chart.js visualizations across all 5 GPTW dimensions: Credibility, Respect, Fairness, Pride, Camaraderie |
| Survey completion confirmation | Users expect feedback that their submission was received; absence creates re-submission anxiety | LOW | Simple confirmation dialog/page post-submit |
| Form validation with error messages | Standard web form expectation; missing validation = data quality problems | LOW | Required field guards, guideline tooltips on ambiguous questions |
| Email invitation with survey name and link | Professional surveys arrive via branded, readable email — not a raw URL | LOW | SMTP-based, admin configures own credentials; template must include survey name |
| Percentage/score aggregation by dimension | The 5 GPTW dimensions (Credibility, Respect, Fairness, Pride, Camaraderie) must be computed from Likert responses and displayed as % favorable | HIGH | Core analytical output; this is what "culture survey results" means to HR professionals |
| ENPS (Employee Net Promoter Score) | Standard metric in every engagement platform; Culture Amp, Officevibe, Great Place to Work all compute it | MEDIUM | Formula: % Promoters minus % Detractors from a 0-10 scale question; needs gauge or infographic display |
| Department/team breakdowns | HR universally needs to slice results by team — aggregate scores hide team-level issues (confirmed pitfall) | HIGH | Depends on demographic data collection; requires department as a collected field |
| Demographic data collection in survey | Enables segmentation; without it, all breakdowns are impossible | LOW | Organization, Service Year, Role Type — already defined in project requirements |
| Top strengths / bottom opportunities | Standard GPTW report output; every HR professional expects a ranked statement list | MEDIUM | Sort statements by favorable % — top 10 strengths and bottom 10 opportunities |
| Response rate tracking | Admins need completion % per survey to evaluate data reliability | LOW | Count of completed / total invited; leaderboard metric |
| Bilingual survey display | For Burmese employee base, English-only surveys create a participation barrier | HIGH | English + Burmese (Myanmar script) rendering; must handle font loading and RTL-adjacent complexities |

### Differentiators (Competitive Advantage)

Features that distinguish this platform from generic survey tools like Google Forms or SurveyMonkey. These align directly with the core value: survey-to-insight pipeline.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| GPTW Trust Index dimension structure pre-built | Generic platforms require manual dimension mapping; this platform ships with Credibility/Respect/Fairness/Pride/Camaraderie pre-wired to specific question ranges | MEDIUM | Unique to this platform; competitors require custom configuration to replicate the GPTW scoring model |
| Deep-dive sub-pillar charts per dimension | Culture Amp and Officevibe show dimension scores; sub-pillar analysis (e.g., Credibility → Communication, Competence, Integrity) goes deeper | HIGH | Requires mapping each statement to both a dimension and a sub-pillar; exposes root causes not visible at dimension level |
| Year-over-year / internal benchmark comparison | Tracking culture trajectory over time is what turns a one-time survey into an ongoing culture program | HIGH | Requires multiple survey periods stored; enables line/bar comparison charts across years |
| Animated Chart.js dashboards | Most HR platforms use static or minimally interactive charts; animation makes data feel alive and invites exploration | MEDIUM | Chart.js animation support is built-in; adds perceived quality without heavy implementation cost |
| Key relationship analysis (Employee/Job/Management) | Beyond the 5 GPTW dimensions, the 3 key relationships (Engagement, Innovation, Leadership Behavior) surface actionable manager insights | HIGH | Requires separate statement mapping to relationship categories |
| Leaderboard metrics view | Side-by-side % scores across all dimensions + ENPS + completion rate creates a scannable executive summary | MEDIUM | Particularly useful for organizations with multiple departments or entities (Yoma Bank + Wave Money) |
| Excel-based question import | Lets admins update or add surveys without developer intervention; important for recurring annual surveys | MEDIUM | Parse uploaded Excel/CSV with bilingual question pairs; map to dimensions automatically or semi-automatically |
| Radar/spider chart for dimension overview | Visualizes all 5 dimensions simultaneously; Culture Amp uses this; more intuitive than separate bar charts for executive reviews | MEDIUM | Chart.js radar chart; requires normalized dimension scores |
| Gap analysis: Manager vs Individual Contributor | Exposes perception gaps between management and staff; high-value insight for leadership development programs | HIGH | Requires Role Type demographic to filter and compare segments |
| Sentiment word cloud on open-ended responses | Turns qualitative text into visual signal; quick scan of common themes without reading individual responses | HIGH | Requires basic NLP tokenization or word frequency analysis; can be done client-side with simple word counting |
| SMTP onboarding modal with test send | Reduces friction for admin setup; most HR tools require IT involvement for email configuration | LOW | Self-serve SMTP configuration with a "send test email" button validates credentials before real distribution |
| Admin panel with survey lifecycle management | Survey status tracking (draft → active → closed) and response monitoring in one view | MEDIUM | Standard admin workflow; currently missing from generic tools adapted for HR use |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time survey analytics during collection | Looks impressive in demos; admins want to see results as they come in | Creates anchoring bias — admins may share partial results, start acting on incomplete data, or close surveys early when target responses hit. Distorts the survey integrity. | Show results only after survey closes or after a minimum response threshold is met |
| Individual response identification | HR may want to know who said what for follow-up | Destroys psychological safety; Culture Amp, Officevibe, and every serious platform enforce anonymity. Employees give dishonest answers when they fear attribution. | Enforce anonymity threshold (e.g., show breakdown only when N >= 5 for a segment) |
| AI-generated action plans from survey results | Seems like high value; Culture Amp offers this as a premium feature | For a single-organization deployment, AI action plan quality requires large benchmark datasets. Output quality is low without training data. Complexity is HIGH for marginal value. | Provide prioritized statement rankings (Top 10/Bottom 10) and let HR interpret; defer AI features to v2 after data accumulates |
| Recurring/scheduled survey automation | Reducing admin friction for repeating annual surveys | Out of scope per PROJECT.md; adds scheduling complexity (cron, queue management) that is unnecessary for a manual-distribution workflow | Manual distribution with saved employee list reuse |
| Multi-tenant / multi-organization isolation | Handling both Yoma Bank and Wave Money as separate tenants with separate admin logins | Out of scope per PROJECT.md; adds auth complexity. The two organizations are separate via demographic field, not separate tenants. | Use Organization demographic field to filter and segment results within single deployment |
| OAuth/SSO admin login | Seems more secure than static credentials | Out of scope per PROJECT.md; adds dependency on identity provider, token management complexity. Static credentials are sufficient for single-admin MVP. | Static username/password with session management |
| Mobile native app (iOS/Android) | Employees on mobile want a native experience | Out of scope per PROJECT.md; adds separate codebase, app store approvals, push notification management. Web-responsive is sufficient. | Responsive web design ensures mobile usability without native app overhead |
| Database backend (PostgreSQL, etc.) | "Proper" data storage seems more reliable | Out of scope per PROJECT.md; Vercel + CSV storage is a deliberate constraint. Database adds infrastructure complexity and cost for a single-org deployment. | CSV storage with Vercel Blob/KV sync; simple, deployable, meets the requirement |
| Pulse surveys / weekly check-ins | Officevibe's core feature; high frequency micro-surveys | The Survey Yoma use case is annual culture survey cadence, not continuous listening. Weekly pulse surveys require ongoing employee communication infrastructure and different question design. | Annual or bi-annual full survey is the appropriate cadence for GPTW-style culture measurement |

## Feature Dependencies

```
[Admin Authentication]
    └──required by──> [Survey Management]
                          └──required by──> [Email Distribution]
                                                └──required by──> [Response Tracking]

[Survey Creation]
    └──required by──> [Email Distribution]
    └──required by──> [Survey Form (employee view)]

[Survey Form (employee view)]
    └──required by──> [Response Collection]
                          └──required by──> [Analytics Dashboard]

[Demographic Data Collection]
    └──required by──> [Department Breakdowns]
    └──required by──> [Gap Analysis (Manager vs IC)]
    └──required by──> [Leaderboard Metrics]

[Response Collection (multi-period)]
    └──required by──> [Year-over-Year Comparison]
    └──required by──> [Internal Benchmark Charts]

[Anonymity Threshold]
    └──required by──> [Department Breakdowns] (cannot show breakdowns below threshold)
    └──conflicts with──> [Individual Response Identification]

[GPTW Dimension Scoring]
    └──required by──> [5 Dimension Charts]
    └──required by──> [Deep-Dive Sub-Pillar Charts]
    └──required by──> [Radar/Spider Chart]
    └──required by──> [Leaderboard Metrics]
    └──required by──> [Top/Bottom Statement Rankings]

[ENPS Question]
    └──required by──> [ENPS Visualization]
```

### Dependency Notes

- **Admin Authentication required by Survey Management:** Without auth guard, anyone can create or delete surveys; must be phase 1.
- **Survey Form required by Response Collection:** The employee-facing form must work before any analytics are meaningful.
- **Demographic Data Collection required by Department Breakdowns:** If demographics aren't collected at survey time, segmentation is impossible retroactively. Must be in survey form from the start.
- **GPTW Dimension Scoring required by all analytics charts:** The dimension mapping (which question number maps to which dimension) is the core data model; all chart types derive from it.
- **Anonymity Threshold conflicts with Individual Response Identification:** These are mutually exclusive design decisions; enforce anonymity from the start.
- **Response Collection (multi-period) required by Year-over-Year:** At least two survey periods must be stored before comparison charts are meaningful; this is a v1.x or v2 feature.

## MVP Definition

### Launch With (v1)

Minimum viable product that delivers the survey-to-insight pipeline end-to-end.

- [ ] Admin authentication — gate all admin functionality
- [ ] Survey creation with bilingual question import from Excel — admins must be able to load the 46 GPTW statements
- [ ] Employee email list management + unique link generation — one URL per employee, pre-filled email
- [ ] SMTP configuration with onboarding modal — admin self-serves email setup
- [ ] Survey invitation email send — distributes unique links to employee list
- [ ] Employee survey form — multi-section, Likert + open-ended + demographic questions, bilingual
- [ ] Form validation + completion confirmation — data quality and UX closure
- [ ] Response collection to CSV — stores all responses with employee email and timestamp
- [ ] Response rate tracking — % completed visible to admin
- [ ] GPTW dimension scoring (Credibility, Respect, Fairness, Pride, Camaraderie as % favorable) — core analytical output
- [ ] Analytics dashboard: 5 dimension bar charts + ENPS gauge + Top 10 / Bottom 10 rankings — the main deliverable
- [ ] Department / demographic breakdown charts — segments results by organization and role type
- [ ] Leaderboard metrics view — scannable executive summary of all KPIs
- [ ] i18n (English + Burmese) — non-negotiable for employee participation

### Add After Validation (v1.x)

Features to add once core pipeline is verified working with real survey data.

- [ ] Deep-dive sub-pillar charts per dimension — trigger: admin feedback that dimension-level is insufficient for action planning
- [ ] Radar/spider chart overlay — trigger: admin wants executive-friendly single-view of all 5 dimensions
- [ ] Key relationship analysis charts (Employee/Job/Management) — trigger: request for engagement, innovation, leadership behavior metrics
- [ ] Gap analysis: Manager vs Individual Contributor — trigger: request for people-manager performance insight
- [ ] Animated chart transitions — trigger: polish phase after functionality validated
- [ ] Sentiment word cloud on open-ended responses — trigger: admin needs to process open-ended answers at scale

### Future Consideration (v2+)

Defer until product-market fit with Yoma Bank / Wave Money is established.

- [ ] Year-over-year benchmark comparison — requires two survey periods of data; build after second annual survey cycle
- [ ] Internal benchmarking trend lines — same dependency as above
- [ ] Industry/external benchmark comparison — requires external benchmark dataset; high complexity, low immediate ROI for single-org deployment
- [ ] AI-generated focus areas or action plans — requires sufficient data accumulation and benchmark dataset; defer until data exists

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Admin authentication | HIGH | LOW | P1 |
| Survey creation + Excel import | HIGH | MEDIUM | P1 |
| Unique link generation + email distribution | HIGH | MEDIUM | P1 |
| SMTP configuration modal | HIGH | LOW | P1 |
| Employee survey form (bilingual, multi-section) | HIGH | HIGH | P1 |
| Response collection to CSV | HIGH | MEDIUM | P1 |
| GPTW dimension scoring + 5 dimension charts | HIGH | HIGH | P1 |
| ENPS visualization | HIGH | MEDIUM | P1 |
| Top 10 / Bottom 10 statement rankings | HIGH | LOW | P1 |
| Department / demographic breakdowns | HIGH | HIGH | P1 |
| Leaderboard metrics | HIGH | MEDIUM | P1 |
| i18n (English + Burmese) | HIGH | HIGH | P1 |
| Response rate tracking | MEDIUM | LOW | P1 |
| Deep-dive sub-pillar charts | HIGH | HIGH | P2 |
| Key relationship charts (Employee/Job/Management) | HIGH | HIGH | P2 |
| Radar/spider dimension chart | MEDIUM | MEDIUM | P2 |
| Gap analysis (Manager vs IC) | MEDIUM | MEDIUM | P2 |
| Animated chart transitions | MEDIUM | LOW | P2 |
| Sentiment word cloud | MEDIUM | HIGH | P2 |
| Year-over-year comparison | HIGH | HIGH | P3 |
| Internal benchmark trend lines | MEDIUM | HIGH | P3 |
| Industry/external benchmarking | LOW | HIGH | P3 |
| AI-generated action plans | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — incomplete without this
- P2: Should have — add in v1.x after core is validated
- P3: Nice to have — defer to v2+

## Competitor Feature Analysis

| Feature | Culture Amp | Officevibe | Google Forms / SurveyMonkey | Survey Yoma Approach |
|---------|-------------|------------|-----------------------------|----------------------|
| Survey creation | Template library (40+ templates) | Pulse survey focused, pre-built weekly check-ins | Fully custom, no templates | Excel import of bilingual GPTW statement list; opinionated structure |
| Distribution | Email + Slack + Teams integrations | Automated weekly cadence | Share link or email; no unique-per-recipient tracking | SMTP-based unique link per employee; admin-controlled cadence |
| Anonymity | Enforced with thresholds | Enforced | Not enforced by default | Enforce; no individual response view in admin |
| GPTW dimensions (Credibility, etc.) | Configurable, not pre-built | Not built-in | Not built-in | Pre-wired to Trust Index model; zero configuration |
| ENPS | Yes, as standard metric | Yes, as standard metric | No (requires custom question) | Yes, pre-configured ENPS question + visualization |
| Department breakdowns | Yes (heatmaps + demographics) | Yes (team level) | No (requires manual analysis) | Yes, via collected demographic fields |
| Year-over-year comparison | Yes (core feature) | Yes (weekly trend graphs) | No | Deferred to v2 (requires multi-period data) |
| Bilingual / multilingual | Yes (enterprise feature, 30+ languages) | Limited | Yes (manual, SurveyMonkey Enterprise) | Native bilingual: English + Burmese (Myanmar script) from day one |
| Pricing model | Enterprise ($) | $5/user/month | Free–Enterprise | Single deployment, no per-seat pricing |
| Benchmark data | Industry benchmarks from 4000+ companies | Team benchmark trends | None | Internal benchmark only (v2+); no external benchmark data initially |
| Action planning | AI-assisted focus areas (premium) | Manager action plans | None | Not in scope; ranked statements surface opportunities without AI overhead |

## Sources

- [Culture Amp Platform Overview](https://www.cultureamp.com/platform) — feature set analysis
- [Officevibe / Workleap Feature List](https://workleap.com/officevibe) — pulse survey and feedback features
- [Great Place to Work Trust Index Model](https://greatplacetowork.me/trust-model/) — GPTW dimension structure: Credibility, Respect, Fairness, Pride, Camaraderie
- [Qualtrics Personal Links Distribution](https://www.qualtrics.com/support/survey-platform/distributions-module/email-distribution/personal-links/) — unique link per recipient standard
- [Top Employee Survey Tools 2026](https://peoplemanagingpeople.com/tools/best-employee-survey-tools/) — competitive landscape
- [Employee Engagement Survey Tools Comparison](https://www.culturemonkey.io/employee-engagement/employee-engagement-survey-tools/) — feature comparison
- [Rethinking Employee Engagement Survey](https://www.hr-brew.com/stories/2025/04/17/rethinking-employee-engagement-surveys) — anti-patterns and pitfalls
- [Multilingual Surveys in Employee Platforms](https://www.specific.app/blog/employee-survey-tools-for-global-teams-how-multilingual-employee-surveys-go-beyond-translation-and-boost-real-engagement-1) — multilingual requirements
- [Best Employee Engagement Tools Q1 2026](https://www.selectsoftwarereviews.com/buyer-guide/best-employee-engagement-software) — current state of market
- [Officevibe vs Culture Amp 2026](https://www.thrivesparrow.com/blog/officevibe-vs-culture-amp) — comparative analysis

---
*Feature research for: Employee Culture Survey Platform (Survey Yoma)*
*Researched: 2026-04-01*
