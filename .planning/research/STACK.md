# Stack Research

**Domain:** Bilingual employee culture survey platform (Next.js + Chart.js + CSV + SMTP + i18n)
**Researched:** 2026-04-01
**Confidence:** HIGH (core stack), MEDIUM (supporting libraries)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.2.4 (stable) | Full-stack React framework | User-specified. App Router provides server components + API routes + Server Actions. Vercel-native deployment with zero config. Turbopack stable in v15 gives fast dev builds. |
| React | 19.x | UI runtime | Bundled with Next.js 15. Server Components allow server-side data fetching without hydration overhead — important for loading CSV data before render. |
| TypeScript | 5.x | Type safety | De-facto standard for Next.js projects. Catches CSV parse errors, chart data shape mismatches, and form schema violations at compile time rather than runtime. |
| Chart.js | 4.5.1 | Chart rendering | User-specified. Canvas-based, lightweight (~60kb gzipped), built-in animation system, and supports all 20+ chart types needed (bar, grouped bar, stacked bar, donut, gauge, radar, line). |
| react-chartjs-2 | 5.3.1 | Chart.js React wrapper | The canonical React adapter for Chart.js. Manages canvas lifecycle (mount/unmount) and re-renders correctly in React's reconciliation model. Required to use Chart.js safely in Next.js. |
| Tailwind CSS | 4.x | Styling | No config file in v4 — import-based setup. 5x faster full builds, 100x faster incremental builds. Works with shadcn/ui. Clean utility classes match the "white, simple" UI requirement. |
| shadcn/ui | cli v4 (March 2026) | Component library | Not a dependency — it copies components into your repo. Tailwind-native, accessible (Radix primitives), fully customizable. Provides forms, dialogs, tables, tooltips, progress bars needed for admin UI. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.8.3 | i18n (English + Burmese) | All user-facing text. Built for App Router — works in Server Components without hydration overhead. ~390kb unpacked vs react-i18next ecosystem (~1.6MB). Use for all translation keys, number formatting, and date formatting. |
| Nodemailer | 8.0.4 | SMTP email delivery | Admin-configured SMTP to send survey invitation emails with unique links. Server-side only (API route or Server Action). Supports any SMTP provider (Gmail, SendGrid, corporate mail servers). |
| react-hook-form | 7.60.x | Form state management | Survey form (46 questions, multi-section), admin login, and email distribution forms. Uncontrolled inputs = minimal re-renders. Critical for survey form performance with many questions. |
| zod | 3.25.x | Schema validation | Pair with react-hook-form via @hookform/resolvers. Validates survey responses, admin credentials shape, SMTP config. Runs on both client and server (API routes). |
| @hookform/resolvers | 5.1.x | react-hook-form + zod bridge | Connects zod schemas directly into react-hook-form's validation lifecycle. Install alongside react-hook-form and zod. |
| papaparse | 5.x | CSV parsing/generation | Read survey response CSVs; generate downloadable CSVs. Streaming support for large response sets. Browser + Node.js compatible. Do NOT use csv-parser (Node-only). |
| exceljs | 4.x | Excel (.xlsx) reading | Parse admin-uploaded question lists (bilingual question Excel files from PDF extraction). More secure than the `xlsx` npm package (see "What NOT to Use"). Handles .xlsx read on the server side. |
| @vercel/blob | latest | File storage | Store and retrieve CSV files on Vercel infrastructure. Use `put()` for writing response CSVs, `list()` for loading them. Set `BLOB_READ_WRITE_TOKEN` via Vercel dashboard. Required for persistence beyond Vercel's ephemeral filesystem. |
| iron-session | 8.x | Admin session management | Encrypted, cookie-based sessions. No database required — perfect for static admin credentials. App Router compatible via `getIronSession(cookies(), config)`. Next.js docs recommend this for simple auth. |
| motion | 12.38.0 | UI animations | Background animations, chart entrance effects, section transitions. Install as `motion` (new package name — replaces `framer-motion`). Use `motion/react` imports. For simple CSS-achievable animations (hover, fade), prefer CSS. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code linting | Use `eslint-config-next` (included in `create-next-app`). Catches common Next.js misconfigurations. |
| Prettier | Code formatting | Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |
| `@types/nodemailer` | TypeScript types for Nodemailer | Install as dev dependency: `npm install -D @types/nodemailer` |
| `@types/papaparse` | TypeScript types for PapaParse | Install as dev dependency |
| Fontsource (`@fontsource-variable/noto-sans-myanmar`) | Burmese font, self-hosted | Self-host via Fontsource rather than Google Fonts — avoids GDPR concerns and works offline. Myanmar Unicode rendering requires Noto Sans Myanmar (covers all Unicode Myanmar blocks including Extended-A and Extended-B). |

---

## Installation

```bash
# Bootstrap project (includes Next.js 15, React 19, TypeScript, Tailwind v4, ESLint)
npx create-next-app@latest survey-yoma --typescript --tailwind --eslint --app --src-dir

# Core charting
npm install chart.js react-chartjs-2

# i18n
npm install next-intl

# Forms and validation
npm install react-hook-form zod @hookform/resolvers

# Email
npm install nodemailer
npm install -D @types/nodemailer

# Storage and file handling
npm install @vercel/blob papaparse exceljs
npm install -D @types/papaparse

# Auth (session)
npm install iron-session

# Animations (new Motion package)
npm install motion

# Burmese font (self-hosted)
npm install @fontsource-variable/noto-sans-myanmar

# shadcn/ui (CLI — copies components to repo, not a runtime dep)
npx shadcn@latest init
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| next-intl | react-i18next | Only if the project already has an i18next ecosystem or needs cross-framework (React Native + web) translations. next-intl is lighter and Server Component-native. |
| iron-session | NextAuth.js | If OAuth providers (Google, GitHub) are ever added. For static credentials only, NextAuth is significant overkill — adds a complex config and requires a database adapter for sessions. |
| exceljs | SheetJS from CDN (`cdn.sheetjs.com`) | SheetJS CDN works if you accept their non-npm distribution model. Avoid the `xlsx` npm package entirely (4-year-old, unpatched CVEs). |
| @vercel/blob | Local filesystem (`/tmp`) | Only for local development. Vercel's filesystem is ephemeral — files written to disk are lost on the next function invocation. Blob is the production-safe path. |
| motion (`motion/react`) | CSS animations | For simple, stateless animations (hover states, fade-ins, loading spinners): use CSS. Motion is justified for complex sequences: chart entrance choreography, multi-step survey transitions, dashboard load sequences. |
| react-chartjs-2 | Recharts, Victory | Only if Chart.js is dropped entirely. react-chartjs-2 is the required adapter for Chart.js in React — not interchangeable with alternative chart libraries. |
| shadcn/ui | MUI, Ant Design | If a pre-built, opinionated design system is acceptable. shadcn/ui matches the "clean, white, simple" aesthetic without imposing a visual brand. MUI's Material Design would conflict with the target aesthetic. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `xlsx` npm package | Last published to npm 4 years ago (v0.18.5). Multiple unpatched CVEs including Prototype Pollution and DoS. Many tutorials still reference it — actively dangerous. | `exceljs` for server-side Excel parsing, or SheetJS from `cdn.sheetjs.com` if you need SheetJS specifically. |
| `next-i18next` | Designed for Pages Router. Requires `serverSideTranslations` pattern that doesn't work with App Router Server Components. | `next-intl` — designed for App Router from the ground up. |
| NextAuth.js (for this use case) | Designed for OAuth and database-backed sessions. Requires adapter config even for credentials. Adds ~30+ files of boilerplate for a single static admin user. | `iron-session` — three lines of code to protect a route with static credentials. |
| `framer-motion` (old package name) | Still works, but the library was rebranded to `motion`. New projects should use `motion` with `motion/react` imports. Both packages co-exist but the canonical package is now `motion`. | `motion` package with `import { motion } from "motion/react"` |
| PostgreSQL / Prisma / any database | Out of scope per project requirements. CSV + Vercel Blob is the specified storage layer. Adding a database introduces a new constraint class (connection limits, migrations) that contradicts the deployment simplicity goal. | `@vercel/blob` + `papaparse` for all storage needs. |
| `react-i18next` + `i18next-http-backend` | Loads translations client-side via HTTP — causes flash-of-untranslated-content (FOUT) and does not work cleanly with RSC. | `next-intl` loads translations at the server level, zero FOUT. |

---

## Stack Patterns by Variant

**For chart components (all Chart.js charts):**
- Wrap every chart in `'use client'` — Chart.js requires browser canvas APIs. It cannot run in Server Components.
- Use `dynamic(() => import('./MyChart'), { ssr: false })` for initial load to prevent SSR canvas errors.
- Register Chart.js components explicitly (`ChartJS.register(...)`) once in a shared file.

**For the survey form (46 questions, multi-section):**
- Use `react-hook-form` with `mode: 'onBlur'` — not `onChange` — to prevent re-renders on every keystroke across 46 fields.
- Store section progress in `useRef` (not state) to track TOC without triggering re-renders.
- Use Zod to define the full response schema, including Likert scale (z.enum(['1','2','3','4','5'])) and open-ended text.

**For Burmese (Myanmar) text rendering:**
- Load Noto Sans Myanmar via Fontsource: `import '@fontsource-variable/noto-sans-myanmar'`
- Apply `font-family: 'Noto Sans Myanmar Variable', sans-serif` to the root when locale is `my` (Myanmar).
- Myanmar script requires OpenType shaping — do not use generic system fonts as fallback, they will render as boxes on systems without Myanmar font support.
- next-intl locale code: `my` (ISO 639-1 for Burmese/Myanmar).

**For Vercel Blob CSV storage:**
- Use a consistent key naming convention: `responses/{survey-id}/{employee-email}.csv` or `responses/{survey-id}/responses.csv` (append mode).
- Read the full CSV on each dashboard load (acceptable for <10,000 rows); for larger datasets, consider aggregated summary CSVs.
- Set `BLOB_READ_WRITE_TOKEN` as a server-only environment variable (no `NEXT_PUBLIC_` prefix).

**For SMTP configuration (admin-owned):**
- Store SMTP credentials (host, port, user, password) in Vercel Blob as an encrypted JSON config file OR in Vercel environment variables set by the admin at deploy time.
- Never expose SMTP credentials to the client — all email sending must occur in Server Actions or API routes.
- Use Nodemailer's `verify()` to test connectivity during the SMTP onboarding modal flow.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15.x | React 19.x | React 19 required for Next.js 15 Server Actions and `use cache` directive. |
| next-intl 4.x | Next.js 15.x + App Router | next-intl 4.0 dropped Pages Router support. App Router only. |
| react-chartjs-2 5.x | Chart.js 4.x | react-chartjs-2 v5 requires Chart.js v4. Do not mix with Chart.js v3. |
| Tailwind CSS 4.x | Next.js 15.x | v4 requires `@tailwindcss/postcss` plugin. No `tailwind.config.js` needed. Works with shadcn/ui cli v4. |
| iron-session 8.x | Next.js 15 App Router | v8 introduced App Router support. Earlier versions (v6, v7) are Pages Router only. |
| motion 12.x | React 19.x | No breaking changes with React 19. `framer-motion` package still works but `motion` is canonical. |
| exceljs 4.x | Node.js 18+ | Runs server-side only in Next.js API routes / Server Actions. Do not import in Client Components. |
| papaparse 5.x | Browser + Node.js | Universal — works in both Client and Server Components. Use for CSV reading/writing alongside @vercel/blob. |

---

## Sources

- [Next.js 15.2.4 current stable (March 2026)](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new) — MEDIUM confidence (blog, corroborated by GitHub releases)
- [Chart.js 4.5.1 npm](https://www.npmjs.com/package/chart.js) — HIGH confidence (official npm)
- [react-chartjs-2 5.3.1 npm](https://www.npmjs.com/package/react-chartjs-2) — HIGH confidence (official npm)
- [next-intl 4.8.3 npm + App Router recommendation](https://dev.to/erayg/best-i18n-libraries-for-nextjs-react-react-native-in-2026-honest-comparison-3m8f) — HIGH confidence (npm + community verification)
- [next-intl 4.0 release notes](https://next-intl.dev/blog/next-intl-4-0) — HIGH confidence (official)
- [Nodemailer 8.0.4 npm](https://www.npmjs.com/package/nodemailer) — HIGH confidence (official npm)
- [iron-session v8 App Router support](https://github.com/vvo/iron-session/releases/tag/v8.0.0) — HIGH confidence (official GitHub)
- [motion 12.38.0 npm](https://www.npmjs.com/package/motion) — HIGH confidence (official npm)
- [Tailwind CSS v4 Next.js setup](https://tailwindcss.com/docs/guides/nextjs) — HIGH confidence (official docs)
- [shadcn/ui cli v4 March 2026](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — HIGH confidence (official changelog)
- [SheetJS xlsx npm CVE warning](https://thelinuxcode.com/npm-sheetjs-xlsx-in-2026-safe-installation-secure-parsing-and-real-world-nodejs-patterns/) — MEDIUM confidence (blog, corroborated by npm publish date)
- [Vercel Blob CSV storage support](https://vercel.com/docs/vercel-blob) — HIGH confidence (official Vercel docs)
- [Noto Sans Myanmar Google Fonts + Fontsource](https://fontsource.org/fonts/noto-sans-myanmar) — HIGH confidence (official Fontsource)
- [react-hook-form 7.60.x + zod 3.25.x compatibility](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) — MEDIUM confidence (community, corroborated by npm versions)

---
*Stack research for: Culture Survey — Bilingual Employee Culture Survey Platform*
*Researched: 2026-04-01*
