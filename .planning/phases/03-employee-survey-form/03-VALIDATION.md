---
phase: 3
slug: employee-survey-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 3 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FORM-01,10 | unit | `npx vitest run token` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | FORM-02,03,04,05 | build | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | FORM-06,07,08 | build | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-02 | 02 | 1 | FORM-09,11,12 | unit | `npx vitest run response` | ❌ W0 | ⬜ pending |

## Wave 0 Requirements

- [ ] `__tests__/services/token.service.test.ts` — add findTokenByValue + markTokenUsed tests
- [ ] `__tests__/api/survey-submit.test.ts` — stubs for response submission

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Floating TOC tracks scroll | FORM-03 | IntersectionObserver + viewport | Scroll through sections, verify TOC highlights |
| Mobile sticky progress bar | FORM-03 | Viewport-dependent | View on 375px width, verify sticky top bar |
| Language toggle preserves form state | FORM-04 | Browser state | Fill 3 questions, toggle EN→MY, verify selections persist |
| Myanmar font rendering | FORM-04 | Visual glyph | Switch to /my, verify Burmese text renders correctly |
| Confirmation dialog | FORM-09 | Modal interaction | Click submit, verify dialog appears with anonymity message |
| Used token shows error | FORM-10 | Full flow | Submit form, revisit same URL, verify 410 error page |

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
