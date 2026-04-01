# Phase 2: Survey Creation and Distribution - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can create surveys with bilingual questions imported from Excel, configure SMTP server settings with a working test-send, and deliver unique personalized invitation emails to a list of employee email addresses. Each employee receives a cryptographically secure unique link. Survey data, tokens, and SMTP settings are stored in separate CSV files via the StorageAdapter from Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Survey Creation Flow
- Two-step creation: Step 1 — survey name + description form. Step 2 — Excel file upload for bilingual questions
- Excel file upload via drag-and-drop zone with file type validation (.xlsx, .xls only) and progress indicator
- exceljs library for server-side Excel parsing (NOT xlsx — CVE risk per research)
- Excel format: columns for questionId, type (likert/open-ended/demographic), englishText, burmeseText, dimension, subPillar, options (JSON for demographic selects)
- After upload, show question preview table with English + Burmese columns side-by-side for admin review
- Survey status lifecycle: draft → active → closed
- Survey list page shows all surveys with name, status badge, question count, response count, created date
- Admin can view survey details but cannot edit questions after survey is active (data integrity)

### SMTP Configuration UX
- Onboarding modal appears on first visit to any admin page when no SMTP settings exist
- Modal has step-by-step fields: host, port (default 587), username, password (masked), from address, from name
- "Send Test Email" button in modal sends to admin's configured from address
- Test email success: green toast notification with "Test email sent successfully"
- Test email failure: red toast with raw SMTP error message (helps IT admin debug)
- Settings page under /admin/settings for subsequent SMTP edits (same fields as modal)
- SMTP credentials stored in smtp-settings.csv via StorageAdapter (single row, overwritten on save)
- Password stored as-is in CSV (acceptable for single-admin MVP; not transmitted to client)

### Email Distribution Flow
- In sidebar under Surveys, admin selects a survey then accesses "Send Invitations" action
- Employee email input: textarea for pasting emails (one per line, comma-separated, or semicolon-separated)
- Email validation: basic format check before sending, duplicates removed, already-invited emails flagged
- Before sending: confirmation showing count of new invitations to send
- Batch send with progress bar showing sent/total count
- Individual send status per email: sent, failed (with error), already invited (skipped)
- Email template: professional HTML email with survey name, personalized greeting, unique link button, organization branding
- Unique link format: {baseUrl}/{locale}/survey/{token}
- After sending: invitation log visible showing all sent emails, timestamps, and status

### Token Generation
- crypto.randomBytes(32).toString('hex') for each token (64-char hex string)
- Token-to-email-to-survey mapping stored in tokens-{surveyId}.csv
- Token columns: token, email, surveyId, status (pending/submitted), createdAt, submittedAt
- No token expiry for v1 — tokens are invalidated only on submission
- Token validated server-side: check exists + status is "pending" before allowing form access
- Used tokens return 410 Gone response
- Each employee gets exactly one token per survey; re-inviting same email reuses existing token

### Claude's Discretion
- Exact Excel column naming and validation error messages
- Email HTML template design details (within professional/friendly constraint)
- Progress bar implementation (polling vs SSE vs optimistic)
- Error retry logic for individual email send failures
- Toast notification library choice (shadcn toast or sonner)
- Exact SMTP modal step layout and field ordering

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Foundation (dependencies)
- `src/lib/types.ts` — Shared TypeScript interfaces (Survey, Question, Token, Response)
- `src/lib/constants.ts` — GPTW dimension mappings, question IDs, sub-pillar assignments
- `src/lib/services/csv.service.ts` — CSV read/write service with ETag retry (use this for all data persistence)
- `src/lib/storage/index.ts` — getStorageAdapter() factory (LocalAdapter dev, BlobAdapter prod)
- `src/middleware.ts` — Auth middleware pattern (admin routes protected)
- `src/components/admin/AdminSidebar.tsx` — Existing sidebar with nav items to extend
- `messages/en.json` + `messages/mm.json` — Translation files to extend with Phase 2 strings

### UI Design Contract
- `.planning/phases/02-survey-creation-and-distribution/02-UI-SPEC.md` — Approved UI design contract with spacing, typography, color, copywriting, and component specifications

### Project Research
- `.planning/research/STACK.md` — Verified stack: exceljs for Excel parsing, Nodemailer 8 for SMTP
- `.planning/research/PITFALLS.md` — SMTP silent failure mitigation, token security patterns
- `.planning/research/ARCHITECTURE.md` — Token service architecture, email service design

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `csv.service.ts` — readRows, appendRow, parseCSV, serializeCSV for all CSV operations
- `StorageAdapter` — getStorageAdapter() for dev/prod file access
- `AdminSidebar.tsx` — Collapsible sidebar to add survey management nav items
- `src/lib/types.ts` — Existing Survey, Question, Token types to extend if needed
- shadcn/ui components — Button, Card, Input, Dialog already initialized
- next-intl — useTranslations/getTranslations pattern established

### Established Patterns
- Server components fetch data, pass to client components as props
- API routes in src/app/api/ for mutations
- iron-session for admin auth on API routes
- CSV files partitioned by entity (surveys.csv, tokens-{surveyId}.csv, smtp-settings.csv)
- All UI strings via translation keys, never hardcoded

### Integration Points
- New API routes: /api/surveys, /api/surveys/[id]/invite, /api/settings/smtp
- New pages: /admin/surveys/new, /admin/surveys/[id], /admin/settings (enhance existing)
- Sidebar nav: add "Surveys" link to existing AdminSidebar
- Token service: new lib/services/token.service.ts
- Email service: new lib/services/email.service.ts

</code_context>

<specifics>
## Specific Ideas

- Email template should feel professional but friendly — not corporate/cold
- SMTP onboarding should guide the admin step-by-step, not overwhelm with all fields at once
- Excel format should be well-documented with a downloadable template
- Survey list should feel like a simple project management view (name, status, actions)
- The invitation flow should feel like a mail merge — paste emails, preview, send

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-survey-creation-and-distribution*
*Context gathered: 2026-04-01*
