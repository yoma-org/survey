# Phase 2: Survey Creation and Distribution - Research

**Researched:** 2026-04-01
**Domain:** Excel import, SMTP email distribution, token generation, admin UI for survey management
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Survey Creation Flow
- Two-step creation: Step 1 — survey name + description form. Step 2 — Excel file upload for bilingual questions
- Excel file upload via drag-and-drop zone with file type validation (.xlsx, .xls only) and progress indicator
- exceljs library for server-side Excel parsing (NOT xlsx — CVE risk per research)
- Excel format: columns for questionId, type (likert/open-ended/demographic), englishText, burmeseText, dimension, subPillar, options (JSON for demographic selects)
- After upload, show question preview table with English + Burmese columns side-by-side for admin review
- Survey status lifecycle: draft → active → closed
- Survey list page shows all surveys with name, status badge, question count, response count, created date
- Admin can view survey details but cannot edit questions after survey is active (data integrity)

#### SMTP Configuration UX
- Onboarding modal appears on first visit to any admin page when no SMTP settings exist
- Modal has step-by-step fields: host, port (default 587), username, password (masked), from address, from name
- "Send Test Email" button in modal sends to admin's configured from address
- Test email success: green toast notification with "Test email sent successfully"
- Test email failure: red toast with raw SMTP error message (helps IT admin debug)
- Settings page under /admin/settings for subsequent SMTP edits (same fields as modal)
- SMTP credentials stored in smtp-settings.csv via StorageAdapter (single row, overwritten on save)
- Password stored as-is in CSV (acceptable for single-admin MVP; not transmitted to client)

#### Email Distribution Flow
- In sidebar under Surveys, admin selects a survey then accesses "Send Invitations" action
- Employee email input: textarea for pasting emails (one per line, comma-separated, or semicolon-separated)
- Email validation: basic format check before sending, duplicates removed, already-invited emails flagged
- Before sending: confirmation showing count of new invitations to send
- Batch send with progress bar showing sent/total count
- Individual send status per email: sent, failed (with error), already invited (skipped)
- Email template: professional HTML email with survey name, personalized greeting, unique link button, organization branding
- Unique link format: {baseUrl}/{locale}/survey/{token}
- After sending: invitation log visible showing all sent emails, timestamps, and status

#### Token Generation
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SURV-01 | Admin can create a new survey with name and description | Survey creation form pattern, CSV service appendRow for surveys.csv |
| SURV-02 | Admin can upload bilingual question list from Excel file (exceljs parser) | exceljs 4.4.0 API, multipart form upload to API route, server-side parsing |
| SURV-03 | Survey questions support Likert scale (5-point), open-ended text, and demographic select types | QuestionType already defined in types.ts; Excel column maps to type field |
| SURV-04 | Survey questions stored with both English and Burmese text | Question interface already has en/my fields; Excel upload writes to questions-{surveyId}.csv |
| SURV-05 | Survey organized into sections matching GPTW dimensions (Camaraderie, Credibility, Fairness, Pride, Respect) plus demographics and open-ended | GPTW_QUESTIONS in constants.ts + Dimension type in types.ts already covers this |
| SURV-06 | Admin can view list of all surveys with status | surveys.csv read by server component, rendered as list with Badge per status |
| EMAL-01 | Admin can configure SMTP server settings (host, port, username, password, from address) via settings page | Nodemailer 8.0.4 createTransport(); smtp-settings.csv via StorageAdapter |
| EMAL-02 | SMTP onboarding modal prompts admin to configure email before first use | Dialog component, check smtp-settings.csv on page load server-side |
| EMAL-03 | Admin can send test email to verify SMTP configuration | Nodemailer transporter.verify() + transporter.sendMail() to from address |
| EMAL-04 | Admin can input employee email addresses and select a survey to distribute | Textarea with email parsing, survey Select, /api/surveys/[id]/invite route |
| EMAL-05 | System generates cryptographically secure unique token per employee-survey pair | crypto.randomBytes(32).toString('hex'), tokens-{surveyId}.csv |
| EMAL-06 | Admin can send professional, friendly invitation emails with survey name and unique link via SMTP | email.service.ts wrapping nodemailer, HTML template with personalized link |
| EMAL-07 | Email template renders correctly with survey name and personalized link | HTML email template with {baseUrl}/{locale}/survey/{token} unique link |
| DATA-01 | All survey responses persisted to CSV files | Established pattern from csv.service.ts — questions-{id}.csv, tokens-{id}.csv |
| DATA-03 | Survey configuration, tokens, SMTP settings, and responses each stored in separate CSV files | File partitioning: surveys.csv, questions-{surveyId}.csv, tokens-{surveyId}.csv, smtp-settings.csv |
</phase_requirements>

---

## Summary

Phase 2 builds on a complete Phase 1 foundation: Next.js 16.2.2, StorageAdapter (local/Blob), csv.service.ts with ETag retry, iron-session auth, next-intl i18n routing, and shadcn/ui. All infrastructure is in place. This phase adds business logic on top.

The three major workstreams are: (1) survey CRUD with Excel import via exceljs, (2) SMTP configuration via nodemailer, and (3) token generation and email distribution. The critical design constraint is that questions must be stored in a per-survey CSV file (questions-{surveyId}.csv) separate from the survey metadata (surveys.csv) and invitation tokens (tokens-{surveyId}.csv). The Token type in types.ts already defines the schema.

The existing `surveys/page.tsx` and `settings/page.tsx` are stubs with placeholder text. Both need to be replaced with real implementations. The AdminSidebar already has a "Surveys" nav item pointing to `admin/surveys`. No new routes need to be added to the sidebar. The shadcn/ui component set needs to be extended with Dialog, Badge, Select, Textarea, Alert, and Progress — none are installed yet.

**Primary recommendation:** Implement in this order: (1) extend CSV write functions to support overwrite (for smtp-settings.csv), (2) survey CRUD + question storage, (3) exceljs Excel import, (4) SMTP settings + test email, (5) token generation service, (6) email distribution with progress feedback.

---

## Standard Stack

### Core (already installed — no installation needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.2 | App Router + API routes | Already installed; all server-side logic in API routes |
| TypeScript | 5.x | Type safety | Already installed; types.ts defines Survey, Question, Token |
| Tailwind CSS | 4.x | Styling | Already installed |
| shadcn/ui | cli v4 | UI components | Already installed; Button, Card, Input, Label in /components/ui |
| next-intl | 4.8.4 | i18n | Already installed; getTranslations/useTranslations pattern established |
| papaparse | 5.5.3 | CSV read/write | Already installed; csv.service.ts wraps it |
| zod | 4.3.6 | Schema validation | Already installed |
| iron-session | 8.0.4 | Admin auth | Already installed; sessionOptions in lib/auth.ts |
| jose | 6.2.2 | JWT verification | Already installed; auth route pattern established |

### New Dependencies — Phase 2
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nodemailer | 8.0.4 | SMTP email sending | Confirmed current version; only mature SMTP library for Node.js |
| exceljs | 4.4.0 | Excel .xlsx parsing | Confirmed current version; xlsx npm package has unpatched CVEs |
| @types/nodemailer | latest | TypeScript types for nodemailer | Dev dependency; nodemailer does not ship own types |

### New shadcn/ui Components to Install
| Component | Purpose | Install Command |
|-----------|---------|----------------|
| Dialog | SMTP onboarding modal | `npx shadcn@latest add dialog` |
| Badge | Survey status indicator | `npx shadcn@latest add badge` |
| Select | Survey dropdown in invitation form | `npx shadcn@latest add select` |
| Textarea | Email address input | `npx shadcn@latest add textarea` |
| Alert | Excel import result feedback | `npx shadcn@latest add alert` |
| Progress | Send invitations progress bar | `npx shadcn@latest add progress` |

### Claude's Discretion — Toast Library
Both shadcn toast and sonner are valid. **Recommendation: use sonner** — it is the shadcn-blessed toast solution as of 2025 (shadcn officially recommends sonner in their docs), simpler API (one line to show a toast), better defaults for stacked notifications.

```bash
npm install nodemailer exceljs sonner
npm install -D @types/nodemailer
npx shadcn@latest add dialog badge select textarea alert progress
```

**Version verification (confirmed 2026-04-01):**
- nodemailer: 8.0.4 (latest stable)
- exceljs: 4.4.0 (latest stable)
- sonner: 2.0.7 (current per npm — already in node_modules from zod dependency chain)

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── surveys/
│   │   │   │   │   ├── page.tsx              # Survey list (replace stub)
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx          # Survey creation form (new)
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx          # Survey detail + invite (new)
│   │   │   │   │       └── invite/
│   │   │   │   │           └── page.tsx      # Send invitations (new)
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx              # SMTP settings (replace stub)
│   ├── api/
│   │   ├── surveys/
│   │   │   ├── route.ts                      # GET list, POST create (new)
│   │   │   └── [id]/
│   │   │       ├── route.ts                  # GET detail, DELETE (new)
│   │   │       └── invite/
│   │   │           └── route.ts              # POST send invitations (new)
│   │   └── settings/
│   │       ├── smtp/
│   │       │   └── route.ts                  # GET/PUT smtp settings (new)
│   │       └── smtp/test/
│   │           └── route.ts                  # POST test email send (new)
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx                  # EXISTS — no changes needed
│   │   ├── SMTPOnboardingModal.tsx           # New — onboarding dialog
│   │   ├── SMTPSettingsForm.tsx              # New — reused in modal + settings page
│   │   ├── SurveyCreateForm.tsx              # New — step 1: name + description
│   │   ├── ExcelUploadStep.tsx               # New — step 2: file upload + preview
│   │   └── EmailDistributionForm.tsx         # New — invite textarea + progress
├── lib/
│   ├── services/
│   │   ├── csv.service.ts                    # EXISTS — add writeRows() for overwrite
│   │   ├── token.service.ts                  # New — generate + validate tokens
│   │   └── email.service.ts                  # New — nodemailer transporter + send
│   └── types.ts                              # EXISTS — Token type already defined; add SmtpSettings
```

### Pattern 1: Excel Import — Server-Side API Route with FormData

**What:** Client uploads .xlsx file via FormData POST. Server API route receives file buffer, passes to exceljs, returns parsed question rows as JSON.
**When to use:** SURV-02 — Excel file upload for bilingual question import.

```typescript
// src/app/api/surveys/[id]/questions/route.ts
// Source: exceljs 4.x docs — workbook.xlsx.load(buffer)
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const questions: Question[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const [questionId, type, englishText, burmeseText, dimension, subPillar, optionsJson] =
      row.values.slice(1) as string[]; // slice(1) because exceljs row.values is 1-indexed
    questions.push({
      id: questionId,
      type: type as QuestionType,
      en: englishText,
      my: burmeseText,
      dimension: dimension as Dimension,
      subPillar,
      options: optionsJson ? JSON.parse(optionsJson) : undefined,
    });
  });

  return Response.json({ questions });
}
```

**Critical exceljs detail:** `row.values` in exceljs is 1-indexed (index 0 is undefined). Always use `.slice(1)` to get column values as a standard 0-indexed array.

### Pattern 2: SMTP Configuration with Nodemailer Verify

**What:** Store SMTP settings in smtp-settings.csv. Nodemailer transporter created from stored config. `transporter.verify()` used for test-send validation.
**When to use:** EMAL-01, EMAL-02, EMAL-03.

```typescript
// src/lib/services/email.service.ts
// Source: nodemailer 8 docs — https://nodemailer.com/smtp/
import nodemailer from 'nodemailer';
import type { SmtpSettings } from '@/lib/types';

export function createTransporter(settings: SmtpSettings) {
  return nodemailer.createTransport({
    host: settings.host,
    port: Number(settings.port),
    secure: Number(settings.port) === 465,    // SSL only for port 465; STARTTLS otherwise
    auth: {
      user: settings.username,
      pass: settings.password,
    },
    connectionTimeout: 15_000,    // 15s — corporate networks are slow
    socketTimeout: 15_000,
  });
}

export async function testSmtpConnection(settings: SmtpSettings): Promise<void> {
  const transporter = createTransporter(settings);
  await transporter.verify(); // throws on failure; catch and return error string to client
}
```

**Key nodemailer 8 detail:** `secure: true` is only for port 465 (SSL). Port 587 uses STARTTLS automatically when `secure: false`. Getting this wrong is the #1 cause of SMTP connection failures.

### Pattern 3: Token Generation — crypto.randomBytes

**What:** Generate 64-character hex tokens using Node.js built-in crypto. Store in tokens-{surveyId}.csv. Re-use existing token if same email re-invited.
**When to use:** EMAL-05 — unique token per employee-survey pair.

```typescript
// src/lib/services/token.service.ts
import { randomBytes } from 'crypto';
import { readRows, appendRow, writeRows } from './csv.service';
import type { Token } from '@/lib/types';

export async function generateToken(surveyId: string, email: string): Promise<string> {
  const filename = `tokens-${surveyId}.csv`;
  const existing = await readRows<Token>(filename);

  // Idempotent — re-invite reuses existing token
  const existingToken = existing.find(t => t.email === email && t.surveyId === surveyId);
  if (existingToken) return existingToken.token;

  const token = randomBytes(32).toString('hex');  // 64-char hex
  await appendRow(filename, {
    token,
    surveyId,
    email,
    status: 'pending',
    createdAt: new Date().toISOString(),
    submittedAt: '',
  });
  return token;
}

export async function validateToken(token: string, surveyId: string): Promise<Token | null> {
  const rows = await readRows<Token>(`tokens-${surveyId}.csv`);
  return rows.find(t => t.token === token && t.status === 'pending') ?? null;
}
```

### Pattern 4: Sequential Email Dispatch with Per-Send Status

**What:** Send emails one at a time (not parallel) to avoid SMTP rate limiting. Track sent/failed/skipped per address. POST endpoint returns streaming or polls for progress.
**When to use:** EMAL-04, EMAL-06, EMAL-07.

**Claude's Discretion — Progress Implementation:** Recommendation is **optimistic client-side progress** — client sends all emails in a single POST, server processes sequentially and returns a result array. Client shows progress bar optimistically (incrementing as each item would complete) then reconciles with the final result. This avoids the complexity of SSE or polling and is sufficient for MVP batch sizes (< 500 emails).

```typescript
// API route returns result array after all sends complete
// src/app/api/surveys/[id]/invite/route.ts
export async function POST(request: Request) {
  const { emails } = await request.json();
  const results: { email: string; status: 'sent' | 'failed' | 'skipped'; error?: string }[] = [];

  for (const email of emails) {
    try {
      const token = await generateToken(surveyId, email);
      await sendInvitation(email, token, survey);
      results.push({ email, status: 'sent' });
    } catch (err) {
      results.push({ email, status: 'failed', error: String(err) });
    }
  }
  return Response.json({ results });
}
```

### Pattern 5: csv.service.ts — Missing writeRows() for Overwrite

**What:** The existing csv.service.ts only has `appendRow()` (read-mutate-write for single row appends). SMTP settings require overwrite semantics (single row, always replace). Add `writeRows()`.
**When to use:** smtp-settings.csv — single row, overwritten on every save.

```typescript
// Addition to src/lib/services/csv.service.ts
export async function writeRows(
  filename: string,
  rows: Record<string, string>[]
): Promise<void> {
  const adapter = getStorageAdapter();
  const csv = serializeCSV(rows);
  // No ETag retry needed for single-writer settings files
  await adapter.write(filename, csv);
}
```

### Pattern 6: SMTP Onboarding Modal — Server-Side Check

**What:** Each admin page server component checks if smtp-settings.csv exists and has data. If not, passes `hasSmtp: false` to a client component that renders the Dialog.
**When to use:** EMAL-02 — onboarding modal on first visit.

```typescript
// In admin layout or individual page server components
const smtpRows = await readRows<SmtpSettings>('smtp-settings.csv');
const hasSmtp = smtpRows.length > 0 && !!smtpRows[0].host;
// Pass hasSmtp as prop to client component
// Client component: if (!hasSmtp) show <SMTPOnboardingModal />
```

**Important:** The onboarding modal must NOT be rendered on the settings page itself (would create infinite redirect). Check for this edge case explicitly.

### Anti-Patterns to Avoid

- **Parsing Excel on the client:** exceljs is a Node.js library. It cannot run in the browser. All Excel parsing must happen in API route handlers.
- **Parallel email sends:** Using `Promise.all()` for bulk email will hit SMTP rate limits and get the server IP flagged. Use sequential `for...of` loop.
- **Importing nodemailer in a Client Component:** nodemailer uses Node.js `net`/`tls`/`dns` modules that don't exist in the browser. Email service must be server-side only.
- **Storing SmtpSettings in React state across requests:** The transporter should be created fresh from stored settings on each email API call — do not cache nodemailer transporters in module scope (they hold TCP connections that go stale).
- **Blocking API response while sending 100+ emails:** For large batches, the HTTP connection may time out. For MVP, sequential sends with a reasonable batch cap (< 500) are acceptable. Note Vercel's 60-second function timeout.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel file parsing | Custom buffer parser | exceljs workbook.xlsx.load() | Cell type coercion, Unicode, merged cells, formula cells — all handled |
| SMTP transport | Raw TCP SMTP implementation | nodemailer createTransport() | AUTH negotiation, STARTTLS, connection pooling, error codes are complex |
| Email HTML rendering | String template concatenation | Inline HTML string in nodemailer `html` option | For this MVP scale, inline HTML is sufficient; avoid introducing a template engine |
| Token generation entropy | UUID v4 or timestamp | crypto.randomBytes(32) | Math.random() is not cryptographically secure; randomUUID() is acceptable alternative |
| Email address validation | Custom regex | Standard email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Complex full RFC 5322 validation is overkill; basic format check is sufficient |
| Progress tracking | WebSocket / SSE server | Optimistic client counter + final result reconciliation | SSE adds server complexity; sequential sends in API route + final JSON response is sufficient |
| CSV overwrite with retry | Custom ETag logic | Standard adapter.write() (no retry for single-writer files) | smtp-settings.csv is only written by one admin; no concurrent write risk |

**Key insight:** The hardest problems in this phase (SMTP negotiation, Excel parsing, token entropy) are already solved by mature libraries. The custom code is only glue.

---

## Common Pitfalls

### Pitfall 1: exceljs row.values is 1-Indexed
**What goes wrong:** Developer does `row.values[0]` expecting the first column. Gets `undefined`. All column mappings are off by one.
**Why it happens:** exceljs follows the Excel convention where columns are 1-based. `row.values[0]` is always `undefined`.
**How to avoid:** Always use `row.values.slice(1)` to convert to a standard 0-indexed array, or access columns by name: `row.getCell('questionId').value`.
**Warning signs:** First question in import has `undefined` for its ID; all imports are silently misaligned.

### Pitfall 2: nodemailer `secure` Flag Misconfiguration
**What goes wrong:** Setting `secure: true` for port 587. Connection hangs or fails with `ECONNREFUSED`. Or setting `secure: false` for port 465, which expects SSL immediately.
**Why it happens:** `secure: true` means "connect with SSL from the start" (port 465). Port 587 uses STARTTLS, which upgrades an unencrypted connection — must use `secure: false`.
**How to avoid:** Always derive `secure` from port number: `secure: Number(settings.port) === 465`.
**Warning signs:** SMTP test email times out for corporate mail servers; `ECONNREFUSED` on port 587.

### Pitfall 3: SMTP Password Transmitted to Client
**What goes wrong:** SMTP settings API GET route returns the full settings object including password to the browser. Password visible in DevTools network tab.
**Why it happens:** Developer returns the full CSV row as JSON for the settings form auto-fill.
**How to avoid:** Never include `password` in API GET responses. Return all fields except password; use a separate `hasPassword: true` flag for the form to indicate a password is already stored. Only accept a new password on PUT/save.
**Warning signs:** `password` field appears in the network tab response for `GET /api/settings/smtp`.

### Pitfall 4: Excel Import Stores File — Only Question Records Should Be Stored
**What goes wrong:** Developer stores the uploaded .xlsx file to Blob storage. File contains no persistent value after parsing and wastes Blob quota.
**Why it happens:** The file upload pattern in UI suggests storing the file.
**How to avoid:** Parse the Excel file in the API route handler, extract question records, store only the parsed JSON/CSV records. The binary file is discarded immediately after parsing. This is documented in UI-SPEC: "The file is parsed client-side by the API route; no file content is stored."
**Warning signs:** Large .xlsx files accumulating in Blob storage.

### Pitfall 5: Survey Deletion Without Cleaning Up Token CSVs
**What goes wrong:** Admin deletes a survey. The `surveys.csv` entry is removed. But `tokens-{surveyId}.csv` and `questions-{surveyId}.csv` remain in storage forever.
**Why it happens:** Delete operation only targets surveys.csv.
**How to avoid:** Survey delete API must also delete `tokens-{surveyId}.csv` and `questions-{surveyId}.csv`. The StorageAdapter's `delete()` method (if it exists) or overwrite with empty content.
**Warning signs:** Orphaned CSV files in Blob storage; token lookup against deleted surveys finds stale records.

### Pitfall 6: SMTP Onboarding Modal Blocks the Settings Page
**What goes wrong:** The modal trigger condition ("show when no SMTP config") fires on the settings page itself, creating a loop: admin goes to settings to configure SMTP, modal appears, clicks "Configure Now," redirects to settings — modal appears again.
**Why it happens:** Modal trigger is global without an exception for the settings route.
**How to avoid:** Check `pathname !== '/admin/settings'` before triggering the modal. The settings page is where SMTP is configured — the modal should never block it.
**Warning signs:** Admin clicks "Configure Now" but ends up back on same page with modal still open.

### Pitfall 7: Vercel Function Timeout on Large Email Batches
**What goes wrong:** Sending 200+ emails sequentially takes > 60 seconds. Vercel serverless functions time out at 60s on Hobby plan, 300s on Pro. The function is killed mid-send, partial batch is sent, admin sees a timeout error.
**Why it happens:** Sequential SMTP sends average 200-500ms each; 200 emails = 40-100 seconds.
**How to avoid:** For MVP, document the practical batch limit (~100 emails per send). Add a batch size check in the API route and return a 400 with guidance if exceeded. For future scale, implement queue-based sending. At current org size this is acceptable.
**Warning signs:** Invitation send fails with a 504 or FUNCTION_TIMEOUT error; partial list of emails shows as sent in the invitation log.

---

## Code Examples

### exceljs: Read .xlsx from Buffer

```typescript
// Source: exceljs 4.x README — https://github.com/exceljs/exceljs#xlsx
import ExcelJS from 'exceljs';

async function parseQuestionsFromExcel(buffer: Buffer): Promise<Question[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);  // load from Buffer, not file path
  const sheet = workbook.worksheets[0];

  const questions: Question[] = [];
  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; // skip header row
    // row.values is 1-indexed in exceljs — index 0 is undefined
    const values = row.values as (string | undefined)[];
    const [, questionId, type, englishText, burmeseText, dimension, subPillar, optionsJson] = values;
    if (!questionId || !englishText) return; // skip empty rows

    questions.push({
      id: String(questionId),
      type: (type as QuestionType) ?? 'likert',
      en: String(englishText),
      my: String(burmeseText ?? ''),
      dimension: dimension as Dimension,
      subPillar: subPillar ? String(subPillar) : undefined,
      options: optionsJson ? JSON.parse(String(optionsJson)) : undefined,
    });
  });
  return questions;
}
```

### nodemailer: Send Invitation Email

```typescript
// Source: nodemailer 8 docs — https://nodemailer.com/message/
async function sendInvitation(
  to: string,
  token: string,
  surveyName: string,
  baseUrl: string,
  smtpSettings: SmtpSettings
): Promise<void> {
  const transporter = createTransporter(smtpSettings);
  const surveyUrl = `${baseUrl}/en/survey/${token}`;

  await transporter.sendMail({
    from: `"${smtpSettings.fromName}" <${smtpSettings.fromAddress}>`,
    to,
    subject: `You're invited: ${surveyName}`,
    html: buildInvitationHtml(surveyName, surveyUrl, to),
    text: `You are invited to complete the survey: ${surveyName}\n\nYour unique link: ${surveyUrl}`,
  });
}
```

### Token Generation and CSV Storage

```typescript
// Source: Node.js docs — https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
import { randomBytes } from 'crypto';

function generateToken(): string {
  return randomBytes(32).toString('hex'); // 64-char hex string
}

// Token CSV schema: token, email, surveyId, status, createdAt, submittedAt
const tokenRow = {
  token: generateToken(),
  email: employeeEmail,
  surveyId,
  status: 'pending',
  createdAt: new Date().toISOString(),
  submittedAt: '',
};
```

### Admin Auth Guard on API Routes (established pattern)

```typescript
// Source: existing src/app/api/auth/route.ts pattern
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';

async function requireAdmin(): Promise<Response | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null; // authorized
}
```

### Survey CRUD — CSV schema for surveys.csv

```typescript
// surveys.csv columns: id, name, description, status, createdAt, questionCount
interface SurveyRow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  questionCount: string; // CSV is always strings
}
```

### SmtpSettings type — add to types.ts

```typescript
// Add to src/lib/types.ts
export interface SmtpSettings {
  host: string;
  port: string;       // CSV string — convert to number when creating transporter
  username: string;
  password: string;   // stored in CSV for MVP; never returned to client
  fromAddress: string;
  fromName: string;
}
```

### Email HTML Template Structure

```typescript
// Professional but friendly — per CONTEXT.md "Specific Ideas"
function buildInvitationHtml(surveyName: string, surveyUrl: string, recipientEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">Survey Yoma</h1>
  </div>
  <h2 style="font-size: 18px; font-weight: 600;">You're invited to share your feedback</h2>
  <p>Hello,</p>
  <p>You have been invited to complete the <strong>${surveyName}</strong> survey. Your responses are confidential and help improve the workplace for everyone.</p>
  <!-- Burmese translation block per EMAL-07 -->
  <p style="color: #6b7280; font-size: 13px;">သင်သည် <strong>${surveyName}</strong> စစ်တမ်းကို ဖြေဆိုရန် ဖိတ်ကြားခြင်းခံရပါသည်။</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${surveyUrl}" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Start Survey</a>
  </div>
  <p style="font-size: 12px; color: #9ca3af;">This link is unique to you. Do not share it. If you have questions, contact your HR team.</p>
</body>
</html>`;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `xlsx` npm for Excel parsing | `exceljs` | xlsx last published 2021 (v0.18.5); CVEs unpatched | Security: use exceljs exclusively |
| `framer-motion` package | `motion` package with `motion/react` imports | 2024 rebrand | Already noted in STACK.md; no Phase 2 motion needed |
| nodemailer `createTransport` returning Promise | nodemailer 8 `createTransport` is synchronous | nodemailer 8.0 | `createTransport()` returns transporter synchronously; `sendMail()` is async |
| next-intl `getServerSideProps` pattern | `getTranslations()` in async Server Components | next-intl 4.x | Already established in Phase 1; continue using this pattern |

**Deprecated/outdated:**
- `xlsx` npm package: Do not use. No exception.
- `nodemailer.createTestAccount()`: For local testing only. Never ship this pattern.
- shadcn `<Toast>` (older toast primitive): Use `sonner` instead per shadcn 2025 recommendation.

---

## Open Questions

1. **Survey question count in surveys.csv**
   - What we know: surveys.csv stores survey metadata including `questionCount`
   - What's unclear: Should questionCount be updated after Excel import completes, or computed dynamically by reading questions-{id}.csv?
   - Recommendation: Store questionCount in surveys.csv and update it after import. Avoids a second CSV read on the survey list page.

2. **SMTP settings CSV vs environment variable**
   - What we know: CONTEXT.md locks the decision — store in smtp-settings.csv via StorageAdapter. PITFALLS.md flags this as a security risk.
   - What's unclear: The architecture research recommends env vars for SMTP passwords; CONTEXT.md says CSV is acceptable for single-admin MVP.
   - Recommendation: Follow CONTEXT.md (CSV storage is locked). Add a comment in the code acknowledging the tradeoff.

3. **Excel template download**
   - What we know: UI-SPEC mentions "Download template (if template provided in later plan)" in the Excel parsing failure error copy.
   - What's unclear: Whether a downloadable Excel template file should be included in Phase 2 or deferred.
   - Recommendation: Include a simple hardcoded Excel template endpoint (`GET /api/surveys/template`) that returns a minimal .xlsx with the correct column headers. exceljs can generate it server-side. This prevents user error and the UI-SPEC already references it.

4. **Re-invite flow: show existing token or regenerate?**
   - What we know: CONTEXT.md locks: "re-inviting same email reuses existing token"
   - What's unclear: Whether the email should be re-sent with the original token, or just silently skipped
   - Recommendation: Re-send the email with the existing token (mark as "re-invited" in results). This handles the case where the original email was lost.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.2 |
| Config file | `vitest.config.ts` (exists at project root) |
| Quick run command | `npx vitest run __tests__/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SURV-01 | Create survey writes to surveys.csv with correct shape | unit | `npx vitest run __tests__/services/csv.test.ts` | ❌ Wave 0 |
| SURV-02 | exceljs parses .xlsx buffer into Question[] with correct field mapping | unit | `npx vitest run __tests__/services/excel.test.ts` | ❌ Wave 0 |
| SURV-03 | Question type field parses all 3 types: likert, open_ended, demographic | unit | `npx vitest run __tests__/services/excel.test.ts` | ❌ Wave 0 |
| SURV-04 | Parsed questions have non-empty `en` and `my` fields | unit | `npx vitest run __tests__/services/excel.test.ts` | ❌ Wave 0 |
| SURV-06 | readRows returns correct Survey[] from surveys.csv | unit | `npx vitest run __tests__/services/csv.test.ts` | ❌ Wave 0 |
| EMAL-01 | createTransporter uses correct secure flag based on port | unit | `npx vitest run __tests__/services/email.test.ts` | ❌ Wave 0 |
| EMAL-05 | generateToken produces 64-char hex string; same email returns same token | unit | `npx vitest run __tests__/services/token.test.ts` | ❌ Wave 0 |
| EMAL-06 | sendMail called with correct to/from/subject/html | unit (mock nodemailer) | `npx vitest run __tests__/services/email.test.ts` | ❌ Wave 0 |
| DATA-03 | Token stored in tokens-{surveyId}.csv, SMTP in smtp-settings.csv | unit | `npx vitest run __tests__/services/token.test.ts` | ❌ Wave 0 |

Manual-only (no automated test justified):
- EMAL-02: SMTP modal appears on first visit — requires browser interaction
- EMAL-03: Test email actually delivered — requires real SMTP server
- EMAL-07: Email template renders correctly — visual test

### Sampling Rate
- **Per task commit:** `npx vitest run __tests__/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/services/csv.test.ts` — covers SURV-01, SURV-06; test writeRows, appendRow, readRows
- [ ] `__tests__/services/excel.test.ts` — covers SURV-02, SURV-03, SURV-04; use a fixture .xlsx buffer
- [ ] `__tests__/services/token.test.ts` — covers EMAL-05, DATA-03; mock csv.service calls
- [ ] `__tests__/services/email.test.ts` — covers EMAL-01, EMAL-06; mock nodemailer createTransport
- [ ] `__tests__/fixtures/sample-questions.xlsx` — fixture Excel file for Excel parsing tests

---

## Sources

### Primary (HIGH confidence)
- exceljs 4.4.0 confirmed via `npm view exceljs version` (2026-04-01)
- nodemailer 8.0.4 confirmed via `npm view nodemailer version` (2026-04-01)
- `.planning/research/STACK.md` — verified stack decisions
- `.planning/research/PITFALLS.md` — SMTP and token pitfalls
- `.planning/research/ARCHITECTURE.md` — service layer patterns and build order
- `src/lib/types.ts` — existing Token, Survey, Question interfaces
- `src/lib/services/csv.service.ts` — existing appendRow, readRows, parseCSV, serializeCSV
- `src/lib/storage/index.ts` — StorageAdapter factory (LocalAdapter dev / BlobAdapter prod)
- `src/components/admin/AdminSidebar.tsx` — sidebar nav items, established patterns
- `package.json` — confirmed installed dependencies and missing Phase 2 deps

### Secondary (MEDIUM confidence)
- nodemailer 8 docs pattern for `secure` flag based on port — established community knowledge, verified against PITFALLS.md guidance
- exceljs row.values 1-indexing — documented behavior in exceljs README

### Tertiary (LOW confidence)
- sonner 2.0.7 as shadcn-blessed toast solution — based on shadcn documentation trends; the shadcn docs do recommend sonner but exact version compatibility with this project's shadcn cli v4 not formally verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing deps confirmed from package.json; new deps (nodemailer, exceljs) version-verified via npm
- Architecture: HIGH — patterns directly extend existing Phase 1 code; no novel patterns introduced
- Pitfalls: HIGH — SMTP pitfalls verified from PITFALLS.md (pre-researched); exceljs 1-indexing from library docs
- Validation architecture: HIGH — vitest config confirmed at project root; test file paths follow established `__tests__/` convention

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (nodemailer and exceljs are stable; no fast-moving dependencies in this phase)
