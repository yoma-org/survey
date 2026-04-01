# Surey Yoma -- Comprehensive UX Design Specification

> Complete visual and interaction design system for both UI spaces:
> **Admin Panel** (HR administrators) and **Survey Form** (employees).
> Covers Phase 3 (Survey Form) and Phase 4 (Analytics Dashboard).

**Version:** 1.0.0
**Date:** 2026-04-01
**Extends:** Phase 2 UI-SPEC.md (established design contract)

---

## Table of Contents

1. [Design Brief](#1-design-brief)
2. [Personas](#2-personas)
3. [Mood and Personality Profile](#3-mood-and-personality-profile)
4. [Design Tokens](#4-design-tokens)
5. [Typography System](#5-typography-system)
6. [Spacing and Layout](#6-spacing-and-layout)
7. [Component Specifications](#7-component-specifications)
8. [Survey Form UX -- Phase 3](#8-survey-form-ux)
9. [Admin Dashboard UX -- Phase 4](#9-admin-dashboard-ux)
10. [Micro-interactions and Animation](#10-micro-interactions-and-animation)
11. [Mobile-First Considerations](#11-mobile-first-considerations)
12. [Accessibility Contract](#12-accessibility-contract)
13. [Implementation Notes](#13-implementation-notes)

---

## 1. Design Brief

Surey Yoma serves two distinct user groups through two distinct experiences. The **Admin Panel** is a data-dense operational tool where HR professionals create surveys, distribute them, and interpret results -- it must feel professional, organized, and trustworthy. The **Survey Form** is the employee-facing experience -- it must feel approachable, low-friction, and psychologically safe so that employees answer honestly.

The overarching design language is **clean, white, minimal, and warm-professional**. The platform should feel like a well-organized document rather than enterprise software. Myanmar script readability is a first-class constraint that shapes every typographic decision.

---

## 2. Personas

### Persona A: HR Administrator ("Thida")
- **Role:** HR Manager at Yoma Bank, 35-45 years old
- **Tech comfort:** Intermediate -- uses email, Excel, Google Workspace daily; not a developer
- **Context:** Desktop browser (Chrome/Edge), office setting, focused work sessions
- **Goals:** Create surveys quickly, send invitations without IT help, understand results at a glance
- **Pain points:** Overwhelmed by too many charts, confused by acronyms, needs clear "what to do next" guidance
- **Emotional need:** Confidence ("I understand what this data means") and competence ("I can do this myself")

### Persona B: Bank Employee ("Aung")
- **Role:** Individual contributor at Wave Money or Yoma Bank, 22-45 years old
- **Tech comfort:** Basic to intermediate -- uses phone daily (Viber, Facebook), laptop occasionally
- **Context:** Mobile phone (60-70% likely), possibly during break or end of day, may have slow connection
- **Language:** Many prefer Burmese; some are bilingual
- **Goals:** Complete the survey quickly, feel that responses are anonymous
- **Pain points:** Long forms feel tedious, unclear progress, fear of identification, Myanmar script too small on mobile
- **Emotional need:** Safety ("My answers are anonymous") and progress ("I can see I am almost done")

### Persona C: Survey Reviewer ("Min")
- **Role:** Senior HR leader reviewing dashboard results, 40-55 years old
- **Tech comfort:** Low to intermediate -- needs data presented simply, not interactively
- **Context:** Desktop, may screenshot charts for presentations
- **Goals:** Identify top strengths and problem areas, compare departments, report to leadership
- **Pain points:** Too many charts without hierarchy, unclear which numbers matter most
- **Emotional need:** Clarity ("Show me the three things I need to know")

---

## 3. Mood and Personality Profile

### Brand Personality Spectrum

| Axis | Rating | Rationale |
|------|--------|-----------|
| Playful <-> Serious | 7/10 (Serious) | Survey data is consequential; the tool must feel credible |
| Minimal <-> Rich | 8/10 (Minimal) | White-dominant, no decorative elements, content-first |
| Warm <-> Cool | 4/10 (Warm) | Slightly warm to avoid clinical feel; human-centered |
| Organic <-> Geometric | 7/10 (Geometric) | Clean grid, consistent radii, structured layout |
| Bold <-> Subtle | 6/10 (Subtle) | Blue accent is confident but not loud |
| Modern <-> Classic | 7/10 (Modern) | Contemporary flat design, no skeuomorphism |
| Energetic <-> Calm | 7/10 (Calm) | Survey completion and data review both require focus |

### Emotional Keywords
**Trustworthy, Clear, Calm, Approachable, Organized**

### Design References
- Google Forms (survey simplicity, section-based flow)
- Linear (admin panel information density, clean sidebar)
- Notion (white-first, readable, calm)
- Typeform (progress indication, one-section-at-a-time feel)

---

## 4. Design Tokens

### 4.1 Color System

The existing codebase uses OKLCH CSS custom properties (shadcn base-nova neutral preset) with Tailwind blue-600 as the functional accent. This specification extends that palette with semantic colors for data visualization and the survey form.

#### Core Palette (established -- no changes)

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Background | `#ffffff` | `white` | Page background, card surfaces, modal backgrounds |
| Surface | `#fafafa` | `gray-50` | Sidebar background, admin page background, muted areas |
| Border | `#e5e5e5` | `gray-200` | Card borders, dividers, input borders (via `--border`) |
| Text Primary | `#171717` | `gray-900` | Headings, body text |
| Text Secondary | `#737373` | `gray-500` | Descriptions, helper text, timestamps |
| Text Muted | `#a3a3a3` | `gray-400` | Placeholders, disabled text |

#### Accent Palette (established -- extended)

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Accent | `#2563eb` | `blue-600` | Primary CTAs, active states, brand mark |
| Accent Hover | `#1d4ed8` | `blue-700` | Button hover, link hover |
| Accent Light | `#eff6ff` | `blue-50` | Active sidebar item bg, selected row bg |
| Accent Text | `#1d4ed8` | `blue-700` | Active sidebar text, link text |
| Focus Ring | `#3b82f6/50` | `blue-500/50` | Focus-visible ring on all interactive elements |

#### Semantic Colors

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Success | `#16a34a` | `green-600` | Test email success, submission confirmed |
| Success Light | `#f0fdf4` | `green-50` | Success banner background |
| Warning | `#d97706` | `amber-600` | Low response rates, approaching thresholds |
| Warning Light | `#fffbeb` | `amber-50` | Warning banner background |
| Error | `#dc2626` | `red-600` | Form validation errors, send failures |
| Error Light | `#fef2f2` | `red-50` | Error banner background |
| Info | `#2563eb` | `blue-600` | Informational banners (reuses accent) |
| Info Light | `#eff6ff` | `blue-50` | Info banner background |

#### Data Visualization Palette

For Chart.js charts, a carefully chosen 5-color palette maps to the 5 GPTW dimensions. These colors must be distinguishable in sequence, accessible to color-blind users (tested with deuteranopia and protanopia simulation), and harmonious against white backgrounds.

| Dimension | Hex | Name | Rationale |
|-----------|-----|------|-----------|
| Credibility | `#2563eb` | Blue 600 | Trust, stability -- anchors to brand accent |
| Respect | `#7c3aed` | Violet 600 | Empathy, care -- warm-cool balance |
| Fairness | `#0891b2` | Cyan 600 | Balance, clarity -- distinct from blue |
| Pride | `#ea580c` | Orange 600 | Energy, achievement -- warm complement |
| Camaraderie | `#16a34a` | Green 600 | Growth, togetherness -- nature, harmony |

**Extended chart colors** (for sub-pillars, department breakdowns, etc.):

```
--chart-dimension-credibility: #2563eb;
--chart-dimension-respect: #7c3aed;
--chart-dimension-fairness: #0891b2;
--chart-dimension-pride: #ea580c;
--chart-dimension-camaraderie: #16a34a;

/* Lighter variants for backgrounds/fills (20% opacity equivalent) */
--chart-dimension-credibility-light: #dbeafe;
--chart-dimension-respect-light: #ede9fe;
--chart-dimension-fairness-light: #cffafe;
--chart-dimension-pride-light: #ffedd5;
--chart-dimension-camaraderie-light: #dcfce7;

/* Neutral chart helpers */
--chart-positive: #16a34a;
--chart-neutral: #d97706;
--chart-negative: #dc2626;

/* ENPS specific */
--chart-promoter: #16a34a;
--chart-passive: #d97706;
--chart-detractor: #dc2626;
```

**Contrast verification:** All dimension colors meet WCAG AA (4.5:1) against white backgrounds for text usage. For chart fills/bars, the colors are used at full saturation against white, which exceeds 3:1 for graphical elements.

#### Survey Form -- Likert Scale Colors

For the 5-point Likert scale visual indicator (optional dot or bar on the selected option):

| Response | Color | Hex |
|----------|-------|-----|
| Strongly Agree | Green 600 | `#16a34a` |
| Agree | Green 400 | `#4ade80` |
| Neutral | Gray 400 | `#a3a3a3` |
| Disagree | Orange 400 | `#fb923c` |
| Strongly Disagree | Red 500 | `#ef4444` |

These are **not** shown during form completion (to avoid biasing responses). They are used only in the admin dashboard when displaying response distributions.

### 4.2 CSS Custom Properties (new additions for globals.css)

```css
:root {
  /* Existing shadcn tokens preserved */

  /* Dimension chart colors */
  --chart-credibility: #2563eb;
  --chart-respect: #7c3aed;
  --chart-fairness: #0891b2;
  --chart-pride: #ea580c;
  --chart-camaraderie: #16a34a;

  /* Semantic feedback */
  --success: #16a34a;
  --success-light: #f0fdf4;
  --warning: #d97706;
  --warning-light: #fffbeb;

  /* Survey form */
  --survey-progress: #2563eb;
  --survey-section-active: #2563eb;
  --survey-section-complete: #16a34a;
  --survey-section-pending: #a3a3a3;
}
```

---

## 5. Typography System

### 5.1 Font Families

| Role | Font | Fallback Stack | Usage |
|------|------|---------------|-------|
| Primary (English) | Inter | `system-ui, -apple-system, sans-serif` | All English text |
| Primary (Burmese) | Noto Sans Myanmar Variable | `'Segoe UI', system-ui, sans-serif` | All Burmese text via `.font-myanmar` |
| Monospace | `var(--font-geist-mono)` | `ui-monospace, monospace` | Code, token IDs (admin only) |

**Why Inter:** Clean, highly legible at all sizes, excellent x-height for data-dense dashboards, wide weight range (400-700), optimized for screen reading. Already established in the codebase.

**Why Noto Sans Myanmar Variable:** The only production-quality variable-weight Myanmar font. Maintained by Google. Supports all Myanmar script characters including stacked consonants.

### 5.2 Type Scale

Base unit: 14px (body). Scale: 1.25 ratio (Major Third) for a calm, readable hierarchy.

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Display | 28px / 1.75rem | 600 | 1.15 | -0.02em | Dashboard hero metric, empty state headline |
| H1 | 24px / 1.5rem | 600 | 1.2 | -0.015em | Page titles ("Dashboard", "Survey Results") |
| H2 | 20px / 1.25rem | 600 | 1.25 | -0.01em | Card headers, section titles, modal headings |
| H3 | 16px / 1rem | 600 | 1.3 | 0 | Sub-section headers, chart titles |
| H4 | 14px / 0.875rem | 600 | 1.4 | 0 | Table column headers, form group labels |
| Body | 14px / 0.875rem | 400 | 1.5 | 0 | Default body text, form labels, table cells |
| Body Small | 12px / 0.75rem | 400 | 1.5 | 0 | Helper text, timestamps, badge text |
| Caption | 11px / 0.6875rem | 400 | 1.4 | 0.02em | Chart axis labels, footnotes |
| Overline | 11px / 0.6875rem | 600 | 1.3 | 0.08em | Section labels (uppercase), dimension tags |

### 5.3 Myanmar Script Overrides

Myanmar script requires special handling due to its tall ascenders, deep descenders, and stacked consonant clusters.

| Property | English Value | Burmese Override | Rationale |
|----------|--------------|-----------------|-----------|
| Body line-height | 1.5 | 1.65 | Myanmar descenders clip at 1.5 |
| Body Small min-size | 12px | 13px | Myanmar glyphs below 13px lose legibility on mobile |
| Caption min-size | 11px | 13px | Myanmar is unreadable below 13px |
| H1 line-height | 1.2 | 1.35 | Stacked consonants need vertical room |
| Letter spacing (all) | Various | 0 | Myanmar script should never have modified letter-spacing |

**Implementation:** Apply via locale-conditional class `.font-myanmar` which already exists in globals.css. Add Burmese-specific size overrides:

```css
.font-myanmar {
  font-family: 'Noto Sans Myanmar Variable', 'Segoe UI', system-ui, sans-serif;
}

/* Burmese readability overrides */
.font-myanmar .text-xs { font-size: 13px; }
.font-myanmar .text-sm { line-height: 1.65; }
.font-myanmar .text-base { line-height: 1.65; }
.font-myanmar h1, .font-myanmar .text-2xl { line-height: 1.35; }
.font-myanmar * { letter-spacing: 0 !important; }
```

### 5.4 Survey Form Typography (employee-facing)

The survey form uses a slightly larger base to improve readability on mobile:

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Survey Title | 24px | 600 | Survey name at top of form |
| Section Heading | 18px | 600 | Dimension section titles ("Camaraderie", "Credibility") |
| Question Text | 16px | 400 | Likert statement text -- must be highly readable |
| Question Text (Burmese) | 16px | 400 | Same size; line-height 1.75 for Myanmar script |
| Option Label | 15px | 400 | "Strongly Agree" / "Agree" etc. |
| Helper Text | 13px | 400 | Instructions, tooltips |
| TOC Item | 13px | 500 | Section names in floating navigation |

**Rationale for larger survey text:** Employees complete surveys on phones with varying screen sizes and in varied lighting conditions. The 16px question text ensures readability without zooming. Myanmar script especially benefits from the larger base.

---

## 6. Spacing and Layout

### 6.1 Spacing Scale

Base unit: 4px. The scale follows multiples of 4, consistent with Phase 2 UI-SPEC.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-0` | 0px | `0` | Reset |
| `space-1` | 4px | `1` | Icon gaps, inline icon-to-text |
| `space-2` | 8px | `2` | Input vertical padding, compact gaps |
| `space-3` | 12px | `3` | Button internal padding, small card padding |
| `space-4` | 16px | `4` | Standard card padding, form field gap |
| `space-5` | 20px | `5` | -- |
| `space-6` | 24px | `6` | Section margin-bottom, modal padding |
| `space-8` | 32px | `8` | Card grid gap, page content top |
| `space-10` | 40px | `10` | -- |
| `space-12` | 48px | `12` | Page section breaks |
| `space-16` | 64px | `16` | Page vertical padding |

### 6.2 Layout Grid

#### Admin Panel

| Breakpoint | Columns | Gutter | Margin | Sidebar |
|------------|---------|--------|--------|---------|
| Mobile (<768px) | 1 | 16px | 16px | Hidden (hamburger) |
| Tablet (768-1023px) | 2 | 24px | 24px | Collapsed (64px icons) |
| Desktop (1024-1279px) | 3 | 24px | 24px | Expanded (224px) |
| Wide (1280px+) | 4 | 32px | 32px | Expanded (224px) |

- Admin content max-width: `1200px` (prevents ultra-wide line lengths)
- Dashboard chart grid: 2 columns on tablet, 3 on desktop, 4 on wide
- Chart card min-width: `320px` (ensures chart readability)

#### Survey Form

| Breakpoint | Layout | Max-width | Margin |
|------------|--------|-----------|--------|
| Mobile (<640px) | Single column, full-width | 100% | 16px |
| Tablet (640-1023px) | Centered column | 640px | auto |
| Desktop (1024px+) | Centered column + left TOC | 720px content + 240px TOC | auto |

- Survey content max-width: `720px` (optimal reading width: ~65-75 characters for English, proportional for Myanmar)
- TOC width: `240px` (desktop only, sticky positioned)
- Question card spacing: `24px` between questions, `48px` between sections

### 6.3 Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `radius-sm` | 6px | `rounded-md` | Buttons, badges, inputs |
| `radius-md` | 8px | `rounded-lg` | Cards, dropdowns, tooltips |
| `radius-lg` | 10px | `rounded-xl` | Modal dialogs, larger cards |
| `radius-full` | 9999px | `rounded-full` | Avatars, pill badges, progress dots |

**Note:** The shadcn base-nova preset uses `--radius: 0.625rem` (10px). The above tokens map to `calc(var(--radius) * factor)` as defined in globals.css.

---

## 7. Component Specifications

### 7.1 Likert Scale Input (new component)

The most critical new component. Handles 46 questions across mobile and desktop.

#### Desktop Layout (>= 640px)

```
[Question Number] Question text in English or Burmese
                                                    line-height: 1.5 (en) / 1.75 (my)

  ( ) Strongly Disagree   ( ) Disagree   ( ) Neutral   ( ) Agree   ( ) Strongly Agree
```

- Radio buttons in a **horizontal row**, evenly spaced
- Labels below each radio (or beside on wide screens)
- Touch target: 44x44px minimum per radio
- Selected state: blue-600 filled circle with subtle scale transition
- Question number in gray-400, 13px, monospace

#### Mobile Layout (< 640px)

```
[1] Question text in English or Burmese
    line-height: 1.5 (en) / 1.75 (my)

  +-----------------------------------------+
  |  ( ) Strongly Disagree                  |
  +-----------------------------------------+
  |  ( ) Disagree                           |
  +-----------------------------------------+
  |  ( ) Neutral                            |
  +-----------------------------------------+
  |  ( ) Agree                              |
  +-----------------------------------------+
  |  ( ) Strongly Agree                     |
  +-----------------------------------------+
```

- Radio buttons in a **vertical stack**, each option as a tappable row
- Full-width tap target (minimum 48px height per option)
- Selected row: `bg-blue-50 border-blue-200` with blue-600 radio fill
- Unselected row: `bg-white border-gray-200`
- Gap between options: 4px (tight for scannability)

#### States

| State | Visual |
|-------|--------|
| Default | Gray border, empty radio circle |
| Hover (desktop) | Light gray background on row |
| Selected | Blue-50 background, blue-600 radio fill, blue-200 border |
| Error (unanswered, after validation) | Red-50 background flash, red border on question card |
| Disabled | Gray-100 background, gray-300 text, cursor-not-allowed |

#### Accessibility
- Each radio group uses `role="radiogroup"` with `aria-labelledby` pointing to the question text
- Each radio: `role="radio"`, `aria-checked`, keyboard navigable with arrow keys
- Error state: `aria-invalid="true"` on the group, `aria-describedby` linking to error message
- Question text ID pattern: `q-{questionId}` (e.g., `q-CAM-01`)

### 7.2 Survey Section Card

Groups questions by GPTW dimension.

```
+----------------------------------------------------------+
| [Dimension Icon]  Section Title                    3/8   |
|  Section description or instruction text                 |
|----------------------------------------------------------|
|                                                          |
|  Question 1...                                           |
|  [Likert scale]                                          |
|                                                          |
|  Question 2...                                           |
|  [Likert scale]                                          |
|                                                          |
+----------------------------------------------------------+
```

- Background: white
- Border: `border-gray-200` (`1px solid`)
- Border radius: `rounded-xl` (10px)
- Padding: 24px desktop, 16px mobile
- Section header: H2 (18px semibold), with completion count right-aligned ("3/8" in gray-400)
- Divider between header and questions: `border-b border-gray-100`
- Question gap: 24px
- Section dimension icon: Lucide icon (ShieldCheck for Credibility, Heart for Respect, Scale for Fairness, Trophy for Pride, Users for Camaraderie)

### 7.3 Floating Table of Contents (Survey Form)

Desktop only (hidden below 1024px). Sticky sidebar on the left.

```
+------------------------+
| Survey Progress        |
|  =============== 65%   |
|                        |
| [*] Camaraderie   8/8 |
| [*] Credibility   9/9 |
| [ ] Fairness      3/8 |  <-- current
| [ ] Pride         0/10|
| [ ] Respect       0/11|
| [ ] Open-Ended    0/2 |
| [ ] Demographics  0/3 |
+------------------------+
```

- Width: 240px
- Position: `sticky top-24`
- Background: white, `border-r border-gray-100`
- Progress bar at top: linear, blue-600 fill on gray-100 track, rounded-full
- Section items:
  - Complete: green-600 checkmark, gray-700 text
  - Current: blue-600 dot, blue-700 text, font-medium
  - Pending: gray-300 empty circle, gray-500 text
- Click to scroll: each TOC item scrolls to the corresponding section via `scrollIntoView({ behavior: 'smooth' })`
- Active tracking: IntersectionObserver on section headers updates the TOC highlight

#### Mobile Progress Alternative

On mobile (< 1024px), the TOC collapses into a **sticky top progress bar**:

```
+--------------------------------------------------+
| Camaraderie  >  Credibility  >  [Fairness]  ...  |
| ========================------------- 65%         |
+--------------------------------------------------+
```

- Sticky position: `top-0 z-30`
- Height: 56px
- Background: white with `border-b border-gray-200 shadow-sm`
- Horizontal scrollable section names with active section highlighted
- Linear progress bar below: 4px height, blue-600 fill

### 7.4 Survey Language Switcher

Positioned in the survey form header, top-right.

```
+------------------+
| EN | [MY]        |  <-- segmented control style
+------------------+
```

- Two-segment toggle: "EN" / "MY"
- Active: `bg-blue-600 text-white`, rounded
- Inactive: `bg-transparent text-gray-600`, hover `bg-gray-100`
- Size: 36px height, 40px per segment
- Border: `border border-gray-200 rounded-lg`
- On toggle: all question text and option labels switch language; form state (selections) is preserved
- Animation: content fade transition, 200ms ease

### 7.5 Dashboard Metric Card (Leaderboard)

For displaying the 11+ leaderboard metrics on the admin dashboard.

```
+---------------------------+
|  Overline Label           |
|  78.5%                    |  <-- Display size, dimension color
|  +3.2 vs last year        |  <-- Trend indicator (optional v2)
+---------------------------+
```

- Size: equal-width grid cells
- Overline: 11px, uppercase, semibold, gray-500
- Metric value: 28px (Display), semibold, colored by dimension (or gray-900 for general metrics)
- Trend (v2): 12px, green-600 for positive, red-600 for negative, with ChevronUp/ChevronDown icon
- Background: white
- Border: `border border-gray-100`
- Border radius: `rounded-lg` (8px)
- Padding: 16px
- Hover: subtle `shadow-sm` elevation
- Grid: 4 columns on wide, 3 on desktop, 2 on tablet, 1 on mobile (scrollable horizontal card strip)

### 7.6 Chart Card (Dashboard)

Standard wrapper for all Chart.js visualizations.

```
+--------------------------------------------------+
| [Chart Title]                      [Filter ...]  |
| Subtitle / description                           |
|--------------------------------------------------|
|                                                  |
|           [Chart.js canvas]                      |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

- Background: white
- Border: `border border-gray-100`
- Border radius: `rounded-xl` (10px)
- Padding: 24px (desktop), 16px (mobile)
- Chart title: H3 (16px semibold)
- Subtitle: Body Small (12px, gray-500)
- Chart canvas: responsive, maintains aspect ratio
- Min-height: 280px (prevents chart compression)
- Loading state: shadcn Skeleton with pulse animation matching chart area
- Empty state: centered text "No responses yet" with BarChart3 lucide icon in gray-300

### 7.7 Confirmation Dialog (Survey Submission)

Shown before final survey submission (FORM-09).

```
+------------------------------------------+
|                                          |
|  [CheckCircle icon, blue-600, 48px]     |
|                                          |
|  Ready to Submit?                        |
|                                          |
|  Your responses will be recorded         |
|  anonymously. You will not be able to    |
|  modify them after submission.           |
|                                          |
|  [Cancel]           [Submit Survey]      |
|                                          |
+------------------------------------------+
```

- Max-width: 420px
- Centered layout
- Icon: lucide `CheckCircle`, 48px, blue-600
- Title: H2 (20px semibold)
- Body: Body (14px), gray-600, text-center
- "Submit Survey" button: blue-600 primary, full-width on mobile
- "Cancel" button: ghost variant
- Dismissible via ESC and backdrop click (unlike SMTP modal)
- Focus trap: focus moves to "Submit Survey" on open

---

## 8. Survey Form UX -- Phase 3

### 8.1 Overall Flow

```
[Token Validation] -> [Welcome Screen] -> [Demographics] -> [Sections 1-5: Likert] -> [Section 6: Open-Ended] -> [Review] -> [Confirmation Dialog] -> [Thank You]
```

**Design decision: Section-at-a-time with scroll, not pagination.**

Rationale: With 46 Likert questions + demographics + open-ended, a paginated approach (one question per page) would require 50+ page transitions, which is tedious on mobile. Instead, all sections are rendered on a single scrolling page with section cards. The floating TOC provides navigation and progress tracking. This mirrors Google Forms' section-based layout, which is familiar to users.

**Alternative considered:** Wizard/stepper with one section per step. Rejected because: (a) 7 steps still feels long, (b) users cannot easily review previous sections, (c) adds complexity to form state management across steps.

### 8.2 Screen Specifications

#### 8.2.1 Token Validation / Loading

When the employee opens their unique URL:

```
+--------------------------------------------------+
|                                                  |
|  [Spinner]                                       |
|  Loading your survey...                          |
|                                                  |
+--------------------------------------------------+
```

- Centered, full viewport
- Spinner: simple CSS animation (no library), blue-600
- If token is invalid or already used:

```
+--------------------------------------------------+
|                                                  |
|  [AlertCircle icon, red-500, 48px]               |
|                                                  |
|  This link is no longer valid                    |
|                                                  |
|  This survey has already been submitted          |
|  or the link has expired.                        |
|                                                  |
+--------------------------------------------------+
```

#### 8.2.2 Survey Form Main Layout

**Desktop (>= 1024px):**

```
+------+--------------------------------------------------+
| TOC  |  [Survey Title]                    [EN | MY]      |
| 240px|  Survey description text                          |
|      |  =============================  65% complete      |
|      |                                                   |
|      |  +--- Section: Camaraderie (1/5) ------+         |
|      |  | Q1. I can count on my colleagues...  |         |
|      |  | ( ) SD  ( ) D  ( ) N  ( ) A  ( ) SA  |         |
|      |  |                                      |         |
|      |  | Q2. I feel we take the time...       |         |
|      |  | ( ) SD  ( ) D  ( ) N  ( ) A  ( ) SA  |         |
|      |  +--------------------------------------+         |
|      |                                                   |
|      |  +--- Section: Credibility (2/5) ------+         |
|      |  | ...                                  |         |
|      |  +--------------------------------------+         |
|      |                                                   |
|      |                 [Submit Survey]                    |
+------+--------------------------------------------------+
```

**Mobile (< 640px):**

```
+--------------------------------------------------+
| [progress bar sticky header]            [EN | MY] |
|  Camaraderie > Credibility > ...         65%      |
+--------------------------------------------------+
|                                                   |
|  Survey Title                                     |
|  Description text                                 |
|                                                   |
|  --- Camaraderie ---                              |
|                                                   |
|  1. I can count on my colleagues to               |
|     step up and help me when I need it.           |
|                                                   |
|  +-------------------------------------------+   |
|  |  ( ) Strongly Disagree                    |   |
|  +-------------------------------------------+   |
|  |  ( ) Disagree                             |   |
|  +-------------------------------------------+   |
|  |  ( ) Neutral                              |   |
|  +-------------------------------------------+   |
|  |  ( ) Agree                                |   |
|  +-------------------------------------------+   |
|  |  ( ) Strongly Agree                       |   |
|  +-------------------------------------------+   |
|                                                   |
|  2. I feel we take the time...                    |
|  ...                                              |
|                                                   |
|                 [Submit Survey]                    |
+--------------------------------------------------+
```

#### 8.2.3 Open-Ended Section

```
+--------------------------------------------------+
| Open-Ended Questions                              |
|                                                   |
| 1. Is there anything unique or unusual about      |
|    this company that makes it a great place       |
|    to work?                                       |
|                                                   |
| +----------------------------------------------+ |
| |                                              | |
| |  [Textarea, min-height: 120px]               | |
| |                                              | |
| +----------------------------------------------+ |
|   Optional -- share as much or as little          |
|   as you would like                               |
|                                                   |
+--------------------------------------------------+
```

- Textarea: min-height 120px, auto-grows with content (max 400px)
- Character guidance: "Optional" helper text in gray-400
- No character limit (but server-side 2000 char max as safety)

#### 8.2.4 Demographics Section

```
+--------------------------------------------------+
| About You                                         |
| Your demographic information helps us analyze     |
| results by group. Individual responses remain     |
| anonymous.                                        |
|                                                   |
| My Organization                                   |
| [v] Select...                                     |
|                                                   |
| My Service Year                                   |
| [v] Select...                                     |
|                                                   |
| Which best describes your current role?           |
| ( ) Individual Contributor                        |
| ( ) People Manager                                |
|                                                   |
+--------------------------------------------------+
```

- Organization and Service Year: shadcn `<Select>` dropdowns
- Role Type: radio buttons (only 2 options, radio is more scannable than dropdown)
- Anonymity reassurance text: italicized, gray-500, placed prominently at section top

#### 8.2.5 Thank You Screen

Shown after successful submission:

```
+--------------------------------------------------+
|                                                   |
|  [CheckCircle icon, green-600, 64px]              |
|                                                   |
|  Thank You!                                       |
|                                                   |
|  Your responses have been recorded                |
|  anonymously. Thank you for taking the            |
|  time to share your feedback.                     |
|                                                   |
|  You may now close this page.                     |
|                                                   |
+--------------------------------------------------+
```

- Centered, full viewport
- Confetti-free (professional context)
- Subtle fade-in animation on the checkmark (300ms, ease-out)
- No "take another survey" CTA (one-time tokens)

### 8.3 Form Validation Strategy

**Philosophy:** Validate on submit, not on blur. Employees should not feel policed while answering. Show all errors at once after submission attempt, then validate individual fields on change.

| Rule | When Checked | Error Display |
|------|-------------|---------------|
| All Likert questions answered | On submit | Red border + message on unanswered question card; auto-scroll to first error |
| Demographics filled | On submit | Red border on empty select/radio group |
| Open-ended optional | Never | No validation |
| No empty submission | On submit | Toast: "Please answer all required questions" |

**Error scroll behavior:** On submit failure, smooth-scroll to the first unanswered question with a brief (300ms) red-50 background flash animation on the question card to draw attention.

**Error count badge:** The sticky progress header shows a red badge with error count: "3 unanswered" next to the progress bar.

---

## 9. Admin Dashboard UX -- Phase 4

### 9.1 Information Architecture

The dashboard must present 12+ chart types without overwhelming the HR admin. The solution: **progressive disclosure through a structured page hierarchy**.

#### Dashboard Page Structure

```
/admin/dashboard
  |
  +-- Survey Selector (top, persistent)
  |
  +-- Executive Summary (always visible)
  |     |-- EES Score (hero metric)
  |     |-- Response Rate
  |     |-- ENPS Score
  |     |-- Great Place to Work %
  |
  +-- Leaderboard Metrics (always visible)
  |     |-- % Credibility, Respect, Fairness, Pride, Camaraderie
  |     |-- % Engagement, Innovation, Leadership
  |
  +-- Key Visualizations (scrollable sections)
  |     |-- Dimension Overview (bar chart)
  |     |-- Response Distribution (donut chart)
  |     |-- Top 10 Strengths (horizontal bar)
  |     |-- Bottom 10 Opportunities (horizontal bar)
  |
  +-- Department Breakdown (collapsible section)
  |     |-- Dimension scores by organization
  |     |-- Dimension scores by role type
  |     |-- Dimension scores by service year
  |
  +-- Anonymity Notice (footer)
        "Segments with fewer than 5 responses are hidden to protect anonymity"
```

### 9.2 Executive Summary Row

The first thing the admin sees. Four hero metric cards in a horizontal row.

```
+-------------+  +-------------+  +-------------+  +-------------+
| EES Score   |  | Responses   |  | ENPS        |  | GPTW        |
|   72.4%     |  |   186/240   |  |   +32       |  |   78.1%     |
| Favorable   |  | 77.5% rate  |  | Promoters   |  | "Great"     |
+-------------+  +-------------+  +-------------+  +-------------+
```

- 4 cards, equal width, responsive (2x2 on tablet, stack on mobile)
- Each card: metric overline (11px uppercase), value (28px semibold), context label (12px gray-500)
- EES Score: blue-600 text
- Response Rate: green-600 if >= 70%, amber-600 if 50-70%, red-600 if < 50%
- ENPS: green-600 if positive, red-600 if negative (signed number, e.g., "+32")
- GPTW: blue-600 text

### 9.3 Dimension Overview Bar Chart

The signature chart. Shows all 5 GPTW dimensions as % favorable.

```
+-------------------------------------------------------+
| Key Dimensions -- % Favorable                          |
| How employees rated each of the 5 GPTW dimensions     |
|-------------------------------------------------------|
|                                                       |
|  Credibility  [=============================] 78.2%   |
|  Respect      [===========================]   74.5%   |
|  Fairness     [========================]      69.8%   |
|  Pride        [==============================] 82.1%  |
|  Camaraderie  [================================] 85.3%|
|                                                       |
+-------------------------------------------------------+
```

- Chart type: horizontal bar (Chart.js)
- Each bar colored with its dimension color
- Value label at end of each bar
- Sort order: fixed dimension order (matches survey sections), NOT by value
- Rationale for fixed order: consistent across surveys enables pattern recognition over time

### 9.4 Response Distribution Donut

```
+-----------------------------------+
| Response Distribution             |
|-----------------------------------|
|                                   |
|      [Donut chart]                |
|    Positive: 72.4%               |
|    Neutral: 15.2%                |
|    Negative: 12.4%               |
|                                   |
+-----------------------------------+
```

- Three segments: Positive (green-600), Neutral (amber-500), Negative (red-500)
- Center text: overall % favorable (large, semibold)
- Legend below chart, horizontal

### 9.5 ENPS Gauge

```
+-----------------------------------+
| Employee Net Promoter Score       |
|-----------------------------------|
|                                   |
|    [Semi-circle gauge]            |
|           +32                     |
|                                   |
|  Detractors  Passives  Promoters  |
|    15.2%     28.3%     56.5%     |
|                                   |
+-----------------------------------+
```

- Semi-circle gauge: gradient from red (left) through yellow (center) to green (right)
- Needle indicates score position
- Score displayed large and centered below arc
- Breakdown bar below: three-segment horizontal bar showing D/P/P percentages

### 9.6 Top 10 / Bottom 10 Charts

```
+-------------------------------------------------------+
| Top 10 Strengths                                       |
|-------------------------------------------------------|
| 1. I have fun working here (CAM-08)       [====] 92%  |
| 2. I'm proud to tell others... (PRI-32)   [====] 89%  |
| 3. ...                                                 |
| 10. ...                                                |
+-------------------------------------------------------+
```

- Horizontal bar chart
- Bars colored by their parent dimension color
- Statement text truncated with tooltip for full text on hover
- Question ID shown in gray-400 monospace
- Mobile: bars stack full-width, text wraps

### 9.7 Department Breakdown

```
+-------------------------------------------------------+
| Dimension Scores by Organization                       |
|-------------------------------------------------------|
|                                                       |
|  [Grouped bar chart]                                  |
|  Wave Money vs Yoma Bank across 5 dimensions          |
|                                                       |
+-------------------------------------------------------+
```

- Grouped bar chart: one group per dimension, bars per organization
- Wave Money bar: solid fill; Yoma Bank bar: lighter fill or pattern
- DATA-04 enforcement: if a segment has < 5 responses, replace with "Insufficient data" message in gray italic

### 9.8 Dashboard Responsive Behavior

| Viewport | Chart Grid | Metric Cards | Behavior |
|----------|-----------|--------------|----------|
| Mobile (<640px) | 1 column, full-width | 1 column, stacked | Charts horizontally scrollable if needed |
| Tablet (640-1023px) | 2 columns | 2x2 grid | Charts at 50% width minimum |
| Desktop (1024-1279px) | 2 columns | 4 across | Standard layout |
| Wide (1280px+) | 2 columns (max-width 1200px, centered) | 4 across | Content centered, ample whitespace |

**Chart ordering on mobile:** Priority-based stacking:
1. Executive Summary metrics (always first)
2. Leaderboard row
3. Dimension Overview bar chart
4. Response Distribution donut
5. ENPS gauge
6. Top 10 Strengths
7. Bottom 10 Opportunities
8. Department breakdowns (collapsed by default on mobile)

---

## 10. Micro-interactions and Animation

### 10.1 Philosophy

Animations serve three purposes: (1) provide feedback that an action registered, (2) guide attention to changes, (3) make transitions feel natural rather than jarring. They should never delay the user or feel decorative.

**Global rule:** All animations respect `prefers-reduced-motion`. Wrap in `motion-safe:` Tailwind variant.

### 10.2 Transition Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fast` | 100ms | `ease-out` | Radio button fill, checkbox tick, hover bg |
| `normal` | 200ms | `ease-in-out` | Card hover elevation, button state change |
| `smooth` | 300ms | `ease-out` | Page transitions, content fade-in, scroll-to |
| `slow` | 500ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Chart data animation on load, progress bar fill |

### 10.3 Specific Micro-interactions

#### Survey Form

| Element | Trigger | Animation |
|---------|---------|-----------|
| Likert radio selection | Click/tap | Selected option bg fades to blue-50 (100ms); radio fills with blue-600 (100ms scale from 0 to 1) |
| Section completion | Last question in section answered | TOC item: gray circle morphs to green checkmark (200ms); brief green flash (100ms) on section card border |
| Progress bar | Any question answered | Width transition (300ms ease-out); percentage counter animates numerically |
| Scroll to section (via TOC click) | Click TOC item | `scrollIntoView` with smooth behavior; target section border pulses blue once (400ms) |
| Validation error | Submit with unanswered | Scroll to first error (smooth); error card border fades to red (200ms); subtle shake (150ms, 2px horizontal) |
| Language switch | Toggle EN/MY | Content cross-fade (200ms); form state preserved |
| Submit button | Hover | Subtle lift (`translateY(-1px)`) + slight shadow increase (200ms) |
| Submit confirmation dialog | Open | Backdrop fade-in (200ms); dialog scale from 0.95 to 1.0 + opacity 0 to 1 (200ms) |

#### Admin Dashboard

| Element | Trigger | Animation |
|---------|---------|-----------|
| Chart load | Viewport entry (IntersectionObserver) | Chart.js default animation: bars grow from 0, donut segments sweep in (500ms) |
| Metric card | Page load | Staggered fade-in-up (each card 50ms after previous) -- 4 cards total = 200ms sequence |
| Chart card hover | Mouse enter | `shadow-sm` to `shadow-md` transition (200ms) |
| Survey selector change | New survey selected | Existing charts fade out (150ms), skeleton pulse, new data fades in (200ms) |
| Department section | Expand/collapse | Height transition with `overflow-hidden` (300ms ease-in-out) |

### 10.4 Background Animation (UIUX-02)

A **subtle geometric pattern animation** on the survey form background, creating visual interest without distraction.

**Specification:**
- CSS-only animation (no JS library)
- Faint (`opacity: 0.03`) grid of dots or circles on the page background
- Very slow drift animation (`60s linear infinite`)
- Only on the survey form and login page, NOT on the admin panel (admin needs zero distraction)
- Implemented as a `::before` pseudo-element on the page wrapper

```css
.survey-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  background-image: radial-gradient(circle, #2563eb 1px, transparent 1px);
  background-size: 32px 32px;
  animation: bg-drift 60s linear infinite;
  pointer-events: none;
}

@keyframes bg-drift {
  0% { background-position: 0 0; }
  100% { background-position: 32px 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .survey-bg::before { animation: none; }
}
```

---

## 11. Mobile-First Considerations

### 11.1 Critical Mobile Decisions

Given that 60-70% of survey respondents will use mobile phones:

1. **Likert scale goes vertical on mobile.** Horizontal radio buttons with labels do not fit on 360px-wide screens. Vertical stacked options with full-width tap targets are essential.

2. **Survey TOC becomes a sticky progress header on mobile.** The sidebar TOC would consume too much horizontal space. A thin sticky bar with a progress indicator and scrollable section names replaces it.

3. **Question text at 16px minimum.** Myanmar script at 14px is difficult to read on mobile. The survey form uses a larger base size than the admin panel.

4. **Touch targets: 48px minimum on survey form.** Exceeds WCAG's 44px minimum because Myanmar users may have less precise phones. Each Likert option row is at least 48px tall.

5. **No hover-dependent interactions on survey form.** All tooltips use tap-to-reveal on mobile. No information is gated behind hover.

6. **Bottom-anchored submit button on mobile.** The submit button is sticky at the bottom of the viewport when the user scrolls past the last question, ensuring it is always within thumb reach.

### 11.2 Breakpoint System

| Breakpoint | Token | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones / small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops / large tablets |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1536px | Wide monitors |

These are Tailwind 4 defaults. No custom breakpoints needed.

### 11.3 Mobile Performance Budget

- Survey form initial JS: < 100KB gzipped (no heavy chart libraries loaded)
- Time to interactive: < 3 seconds on 3G
- No external image assets on survey form (icons via Lucide inline SVG)
- Chart.js loaded only on admin dashboard (dynamic import with `ssr: false`)

---

## 12. Accessibility Contract

### 12.1 Standards

- WCAG 2.1 AA compliance minimum
- All text contrast: >= 4.5:1 (normal text), >= 3:1 (large text >= 18px or 14px bold)
- All interactive element contrast: >= 3:1 against adjacent colors
- Focus indicators: visible on all interactive elements via `focus-visible:ring-2 ring-blue-500/50 ring-offset-2`

### 12.2 Survey Form Accessibility

| Feature | Implementation |
|---------|---------------|
| Screen reader | Full ARIA: `role="radiogroup"`, `aria-labelledby`, `aria-describedby` for error messages |
| Keyboard navigation | Tab moves between questions; Arrow keys navigate within radio groups; Enter activates submit |
| Focus management | On error, focus moves to first invalid field; on dialog open, focus traps to dialog |
| Skip link | "Skip to survey content" link before the progress header |
| Language | `lang` attribute on `<html>` switches between `en` and `my`; screen readers announce the correct language |
| Progress | TOC completion status exposed via `aria-label` on each section (e.g., "Camaraderie, 6 of 8 complete") |
| Error announcements | `aria-live="polite"` region announces error count on submit failure |

### 12.3 Dashboard Accessibility

| Feature | Implementation |
|---------|---------------|
| Chart alt text | Each Chart.js canvas has `aria-label` describing the data (e.g., "Bar chart showing 5 dimension scores. Credibility 78%, Respect 74%...") |
| Data table fallback | Each chart includes a visually hidden `<table>` with the same data for screen reader users. Toggle via "View as table" link below chart |
| Color-blind safe | Dimension colors chosen to be distinguishable under deuteranopia/protanopia. Charts use pattern fills in addition to color when more than 3 data series overlap |
| Keyboard | Charts are not interactive (static renders); all controls (filters, selectors) are keyboard-accessible |

---

## 13. Implementation Notes

### 13.1 Framework-Specific Guidance

| Concern | Implementation |
|---------|---------------|
| Chart rendering | All Chart.js components must be client components (`'use client'`) with dynamic import (`next/dynamic`, `ssr: false`). DASH-09 |
| Chart memory | Use `IntersectionObserver` to lazy-instantiate charts when scrolled into view. Destroy chart instance in `useEffect` cleanup. DASH-10 |
| Data flow | Analytics data aggregated server-side in an analytics service. Passed as serializable props to client chart components. DASH-11 |
| i18n | All new strings added to both `messages/en.json` and `messages/mm.json`. Use `useTranslations` (client) or `getTranslations` (server). |
| Form state | Survey form state managed with React `useState` or `useReducer`. No form library needed -- the form shape is uniform (record of questionId to selected value). |
| Token validation | Server component validates token before rendering form. Invalid/used tokens render error state server-side (no client-side flash). |
| Likert component | Build as `<LikertQuestion>` reusable component accepting `question`, `value`, `onChange`, `error`, `locale` props. |
| Section scroll tracking | Single `IntersectionObserver` on all section headers, updating a `currentSection` state for TOC highlighting. |
| Progress calculation | `(answeredQuestions / totalRequiredQuestions) * 100` -- open-ended questions excluded from required count. |

### 13.2 Tailwind CSS Classes Reference

Common class patterns for implementers:

```
/* Metric card */
rounded-lg border border-gray-100 bg-white p-4

/* Chart card */
rounded-xl border border-gray-100 bg-white p-6

/* Section card (survey) */
rounded-xl border border-gray-200 bg-white p-6 sm:p-4

/* Likert option row (mobile) */
flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-md
min-h-[48px] cursor-pointer
hover:bg-gray-50
data-[selected=true]:bg-blue-50 data-[selected=true]:border-blue-200

/* Likert radio (selected) */
h-5 w-5 rounded-full border-2 border-blue-600 bg-blue-600
motion-safe:transition-colors motion-safe:duration-100

/* Sticky progress header (mobile) */
sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3

/* TOC section item (active) */
flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700

/* TOC section item (complete) */
flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700

/* TOC section item (pending) */
flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400

/* Dashboard metric value */
text-[28px] font-semibold leading-tight tracking-tight

/* Error flash animation */
@keyframes error-flash {
  0% { background-color: transparent; }
  25% { background-color: #fef2f2; }
  100% { background-color: transparent; }
}
.animate-error-flash {
  animation: error-flash 600ms ease-out;
}
```

### 13.3 Chart.js Configuration Defaults

Global Chart.js defaults for visual consistency:

```typescript
import { Chart, defaults } from 'chart.js';

// Typography
defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
defaults.font.size = 12;
defaults.font.weight = '400';
defaults.color = '#737373'; // gray-500

// Grid
defaults.scale.grid.color = '#f5f5f5'; // gray-100
defaults.scale.grid.drawBorder = false;
defaults.scale.ticks.padding = 8;

// Legend
defaults.plugins.legend.labels.usePointStyle = true;
defaults.plugins.legend.labels.pointStyleWidth = 8;
defaults.plugins.legend.labels.padding = 16;
defaults.plugins.legend.labels.font = { size: 12, weight: '500' };

// Animation
defaults.animation.duration = 500;
defaults.animation.easing = 'easeOutQuart';

// Layout
defaults.layout.padding = 0;

// Tooltip
defaults.plugins.tooltip.backgroundColor = '#171717'; // gray-900
defaults.plugins.tooltip.titleFont = { size: 13, weight: '600' };
defaults.plugins.tooltip.bodyFont = { size: 12, weight: '400' };
defaults.plugins.tooltip.cornerRadius = 8;
defaults.plugins.tooltip.padding = 12;
defaults.plugins.tooltip.displayColors = true;
defaults.plugins.tooltip.boxWidth = 8;
defaults.plugins.tooltip.boxHeight = 8;
defaults.plugins.tooltip.usePointStyle = true;
```

### 13.4 Dimension Color Map (for Chart.js datasets)

```typescript
export const DIMENSION_COLORS = {
  credibility: { bg: '#2563eb', light: '#dbeafe', border: '#2563eb' },
  respect:     { bg: '#7c3aed', light: '#ede9fe', border: '#7c3aed' },
  fairness:    { bg: '#0891b2', light: '#cffafe', border: '#0891b2' },
  pride:       { bg: '#ea580c', light: '#ffedd5', border: '#ea580c' },
  camaraderie: { bg: '#16a34a', light: '#dcfce7', border: '#16a34a' },
} as const;

export const SENTIMENT_COLORS = {
  positive:  '#16a34a',
  neutral:   '#d97706',
  negative:  '#dc2626',
} as const;

export const ENPS_COLORS = {
  promoter:  '#16a34a',
  passive:   '#d97706',
  detractor: '#dc2626',
} as const;
```

### 13.5 File Structure for New Components

```
src/
  components/
    survey/
      SurveyForm.tsx          -- Main form wrapper with state management
      SurveyHeader.tsx         -- Title, description, language switcher
      SurveyProgressHeader.tsx -- Mobile sticky progress bar
      SurveyTOC.tsx           -- Desktop floating table of contents
      LikertQuestion.tsx       -- Individual Likert question with radio group
      OpenEndedQuestion.tsx    -- Textarea question component
      DemographicSection.tsx   -- Select/radio demographic inputs
      SurveySection.tsx        -- Section card wrapper with title and progress
      SubmitConfirmDialog.tsx   -- Confirmation dialog before submission
      ThankYouScreen.tsx        -- Post-submission success screen
      TokenErrorScreen.tsx      -- Invalid/expired token error
    dashboard/
      DashboardHeader.tsx       -- Survey selector + title
      MetricCard.tsx            -- Single leaderboard metric
      MetricRow.tsx             -- Executive summary 4-card row
      LeaderboardGrid.tsx       -- Full leaderboard metrics grid
      DimensionBarChart.tsx     -- 5-dimension horizontal bar
      ResponseDonut.tsx         -- Positive/Neutral/Negative donut
      ENPSGauge.tsx            -- Semi-circle ENPS gauge
      TopBottomChart.tsx        -- Top 10 / Bottom 10 horizontal bars
      DepartmentBreakdown.tsx   -- Grouped bar by demographic segment
      ChartCard.tsx            -- Standard chart wrapper with title, loading, empty states
      ChartSkeleton.tsx        -- Skeleton loader for chart area
```

---

## Appendix A: Design Decision Log

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Survey layout | Single scroll page with sections | Wizard/stepper (one section per step) | Fewer transitions, easier review, familiar Google Forms pattern |
| Likert mobile layout | Vertical stacked rows | Horizontal compressed | Touch targets too small on mobile for horizontal; Myanmar text needs width |
| Dashboard hierarchy | Metrics first, then charts | Charts first | Admin needs the "headline numbers" immediately; charts provide depth |
| Chart dimension colors | Distinct hue per dimension | Blue monochromatic shades | Color-blind accessibility; instant visual mapping between legend and chart |
| Survey progress | Combined TOC + progress bar | Step indicator dots | TOC provides both navigation AND progress; dots only show position |
| Validation timing | On submit, then on change | On blur (real-time) | Avoid policing feel; employees should feel free to skip around |
| Background animation | CSS-only dot grid drift | Canvas/WebGL particles | Performance on low-end phones; CSS is GPU-composited; no JS overhead |
| Myanmar body line-height | 1.65 | 1.5 (same as English) | Myanmar descenders clip at 1.5; tested with stacked consonants |

---

## Appendix B: Copywriting Contract (Phase 3 + 4)

### Survey Form Copy

| Surface | Copy | Notes |
|---------|------|-------|
| Survey header | "{Survey Name}" | Dynamic, from survey record |
| Survey description | "Please answer all questions honestly. Your responses are completely anonymous." | Static, translated |
| Section heading | Dimension name (e.g., "Camaraderie") | From question data |
| Likert options | "Strongly Disagree" / "Disagree" / "Neutral" / "Agree" / "Strongly Agree" | Translated in both languages |
| Open-ended helper | "Optional -- share as much or as little as you would like" | Translated |
| Demographics intro | "Your demographic information helps us analyze results by group. Individual responses remain anonymous." | Translated |
| Submit button | "Submit Survey" | Translated |
| Confirmation title | "Ready to Submit?" | Translated |
| Confirmation body | "Your responses will be recorded anonymously. You will not be able to modify them after submission." | Translated |
| Thank you title | "Thank You!" | Translated |
| Thank you body | "Your responses have been recorded anonymously. Thank you for taking the time to share your feedback." | Translated |
| Token error title | "This link is no longer valid" | Translated |
| Token error body | "This survey has already been submitted or the link has expired." | Translated |
| Validation error toast | "Please answer all required questions" | Translated |
| Progress label | "{n}% complete" | Translated, dynamic |

### Dashboard Copy

| Surface | Copy | Notes |
|---------|------|-------|
| Page title | "Dashboard" | Translated |
| No survey selected | "Select a survey to view results" | Translated |
| No responses | "No responses yet" | Translated |
| Anonymity notice | "Segments with fewer than 5 responses are hidden to protect anonymity" | Translated |
| EES overline | "Employee Engagement Score" | Translated |
| Response rate overline | "Response Rate" | Translated |
| ENPS overline | "Employee Net Promoter Score" | Translated |
| GPTW overline | "Great Place to Work" | Translated |
| Insufficient data | "Insufficient data" | Shown when segment < 5 responses |

---

*End of UX Design Specification v1.0.0*
