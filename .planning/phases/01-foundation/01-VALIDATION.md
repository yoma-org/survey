---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (via next.js built-in support) |
| **Config file** | `vitest.config.ts` (Wave 0 creates) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-01 | build | `npx next build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUN-03 | unit | `npx vitest run csv` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUN-02 | unit | `npx vitest run storage` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | FOUN-04 | unit | `npx vitest run constants` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | integration | `npx vitest run auth` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUTH-02 | integration | `npx vitest run session` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | AUTH-03 | unit | `npx vitest run middleware` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | FOUN-05 | integration | `npx vitest run i18n` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | FOUN-06 | unit | `npx vitest run messages` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 1 | UIUX-01 | manual | N/A | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — vitest configuration for Next.js
- [ ] `__tests__/lib/csv.service.test.ts` — stubs for StorageAdapter tests
- [ ] `__tests__/lib/constants.test.ts` — stubs for GPTW question mapping validation
- [ ] `__tests__/lib/auth.test.ts` — stubs for auth flow tests

*Wave 0 is created by the first plan's initial task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Clean white UI design | UIUX-01 | Visual design judgment | Open /admin/dashboard, verify white bg, blue accent, readable fonts |
| Responsive sidebar | UIUX-03 | Viewport-dependent | Resize to 768px, verify sidebar collapses to hamburger |
| Myanmar font rendering | FOUN-05 | Visual glyph rendering | Switch to /my locale, verify Burmese text renders with Noto Sans Myanmar |
| Vercel deployment | DATA-02 | External service | Deploy to Vercel preview, verify CSV read/write via Blob |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
