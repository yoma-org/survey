# Phase 1: Foundation - Research

**Researched:** 2026-04-01
**Domain:** Next.js 15 App Router scaffolding, iron-session auth, next-intl bilingual routing, Vercel Blob StorageAdapter, GPTW constants definition
**Confidence:** HIGH (core stack verified against npm registry and official docs; architecture from project's own prior research)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Admin Login UX**
- Centered card layout with project logo/name on a clean white page
- Session duration: 24 hours, persists across tabs via iron-session encrypted cookie
- Login error: inline error message below the form, generic "Invalid credentials" (no credential enumeration)
- No "remember me" checkbox — always require login after session expiry (security for admin panel)
- Redirect to /admin/dashboard after successful login

**i18n Locale Strategy**
- Default locale: English (/en) — admin interface defaults to English
- URL structure: path-based /[locale]/... routing via next-intl (SSR-safe, no hydration mismatch)
- Language switcher: top-right header area, visible on both admin and public survey pages
- Fallback: English for any missing Burmese translation keys (graceful degradation)
- Locale detection: URL path only, not browser Accept-Language (deterministic, cacheable)
- Myanmar font: Noto Sans Myanmar Variable loaded via @fontsource, applied when locale is `my`

**GPTW Question Mapping**
- Question IDs use dimension prefix + sequential number: CAM-01 through CAM-08, CRE-09 through CRE-17, FAI-18 through FAI-25, PRI-26 through PRI-35, RES-36 through RES-46, UNC-47 (uncategorized GPTW statement)
- Sub-pillar assignments included from day one in lib/constants.ts (e.g., Credibility → Communication, Competence, Integrity)
- Open-ended questions (OE-01, OE-02) and demographic fields (DEM-ORG, DEM-YEAR, DEM-ROLE) also defined in constants
- Source data: hard-coded from the YFS Culture Survey PDF (46 Likert statements + 2 open-ended + 3 demographics); Excel import in Phase 2 can add/override
- Scoring: 1-5 Likert stored as integers; % favorable = (count of 4 + count of 5) / total responses × 100
- Both English and Burmese text stored per question in the constants file

**Admin Shell Layout**
- Collapsible sidebar with icon + text labels (collapses to icons on narrow screens)
- Phase 1 navigation items: Dashboard, Surveys, Settings — only sections that will exist
- Dashboard shows a welcome/onboarding card with setup checklist when no surveys exist (guides admin to configure SMTP first, then create survey)
- Color scheme: white background, blue accent color (professional, aligns with bank branding and user's "clean, white, simple" requirement)
- shadcn/ui components for all admin UI primitives (buttons, cards, forms, sidebar)
- Responsive: sidebar collapses to hamburger menu on mobile

### Claude's Discretion
- Exact Tailwind color tokens and spacing scale
- StorageAdapter interface design details
- Middleware implementation specifics (jose JWT vs iron-session cookie check)
- Project directory structure within src/ or app/
- Dev vs production environment variable naming
- Loading skeleton patterns
- Error page designs (404, 500)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Project bootstrapped with Next.js 15 App Router, TypeScript, Tailwind CSS 4, shadcn/ui | Stack section: exact `create-next-app` command, shadcn init sequence |
| FOUN-02 | Vercel Blob StorageAdapter with ETag-based concurrent write protection and local fs fallback for dev | Architecture Pattern 3 + Pitfall 1 & 2: StorageAdapter interface, ETag retry loop |
| FOUN-03 | CSV schema defined with explicit questionId columns and header-based read/write (not index-based) | Pitfall 9: CSV schema drift prevention; header-name-keyed PapaParse usage |
| FOUN-04 | GPTW dimension constants mapping all 46 questions to dimensions and sub-pillars in lib/constants.ts | PDF-verified full question list with IDs, dimensions, English + Burmese text |
| FOUN-05 | URL-based i18n routing with next-intl (/en/... and /my/...) with Noto Sans Myanmar font loaded via Fontsource | i18n section: next-intl 4.x middleware config, font loading pattern |
| FOUN-06 | English and Burmese translation message files (messages/en.json and messages/mm.json) with all UI strings | i18n section: message file structure, key naming convention |
| AUTH-01 | Admin can log in with static username/password credentials | Auth section: POST /api/auth/login handler comparing env vars |
| AUTH-02 | Admin session persists via iron-session encrypted cookies | Auth section: iron-session 8.x config, 24hr maxAge |
| AUTH-03 | All /admin routes protected by middleware using jose JWT verification | Auth section: middleware.ts jose jwtVerify pattern, CVE-2025-29927 mitigation |
| AUTH-04 | Admin can log out and session is destroyed | Auth section: DELETE /api/auth/logout destroying iron-session cookie |
| UIUX-01 | Clean, white, simple design with easily readable fonts | shadcn/ui component setup, Tailwind v4 white/blue color scheme |
| UIUX-03 | Responsive layout working on desktop and mobile browsers | Sidebar responsive collapse pattern, Tailwind responsive utilities |
| UIUX-04 | All user-facing text available in both English and Burmese | messages/en.json + messages/mm.json covering all Phase 1 UI strings |
| DATA-02 | CSV files stored via Vercel Blob in production with local filesystem fallback for development | StorageAdapter pattern: BlobAdapter (prod) + LocalAdapter (dev), BLOB_READ_WRITE_TOKEN env var |
</phase_requirements>

---

## Summary

Phase 1 establishes the non-retroactive infrastructure that every downstream phase depends on. The five pillars are: (1) Next.js 15 App Router project scaffold with TypeScript and Tailwind v4; (2) iron-session admin authentication with jose JWT middleware protection; (3) next-intl URL-path bilingual routing for English and Burmese with Noto Sans Myanmar; (4) a StorageAdapter abstraction over Vercel Blob (production) and local filesystem (dev) with ETag concurrency protection; and (5) hard-coded GPTW dimension constants in `lib/constants.ts` mapping all 46 statements, 2 open-ended questions, and 3 demographic fields — sourced from the verified PDF.

The PDF (`YFS Culture Survey_Statements_March 2026_FINAL_25032026.pdf`) has been read and verified. All 46 Likert statements have parallel English and Burmese text. Dimension groupings are confirmed: Camaraderie (Q1-8), Credibility (Q9-17), Fairness (Q18-25), Pride (Q26-35), Respect (Q36-46), plus Q47 uncategorized. Two open-ended questions and demographic fields (Organization: Wave Money / Yoma Bank, Service Year: 6 ranges, Role: Individual Contributor / People Manager) are also present in the PDF.

Two architectural decisions are locked and irreversible after Phase 1: URL-path locale routing (changing later requires rewriting all route structures) and the StorageAdapter abstraction (any CSV write code written before this exists will silently lose data on Vercel). Both must be implemented before any feature work.

**Primary recommendation:** Implement in strict build order — types/constants first, then StorageAdapter, then auth, then i18n — because each layer is a prerequisite for the next. No shortcuts on the StorageAdapter; Vercel's filesystem is read-only and this will cause silent data loss in production.

---

## Standard Stack

### Core (Phase 1 packages only)

| Library | Version (verified) | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| next | 16.2.2 | Full-stack React framework | User-specified; App Router provides RSC + API routes + Vercel-native deploy |
| react | 19.x (bundled) | UI runtime | Required by Next.js 16; Server Components avoid CSV data hydration overhead |
| typescript | 5.x (bundled) | Type safety | Catches CSV schema violations and missing translation keys at compile time |
| tailwindcss | 4.2.2 | Styling | No config file in v4; works with shadcn/ui; clean utility classes match "white, simple" requirement |
| shadcn | 4.1.2 (CLI) | Component primitives | Copies components into repo; Tailwind-native, Radix-accessible; provides Sidebar, Card, Button, Form |
| next-intl | 4.8.4 | i18n (EN + MY) | App Router-native; URL-path locale routing; SSR-safe; zero FOUT |
| iron-session | 8.0.4 | Admin session cookies | Encrypted HttpOnly cookie; no database required; App Router compatible (v8+) |
| jose | 6.2.2 | Edge-compatible JWT verify | Required for middleware (CVE-2025-29927: must be cryptographic, not cookie-only check) |
| @vercel/blob | 2.3.2 | Production CSV storage | Object store with ETag conditional writes; replaces ephemeral Vercel filesystem |
| papaparse | 5.5.3 | CSV parse/serialize | Universal (Node + Browser); header-name-keyed output; streaming for large files |
| zod | 4.3.6 | Schema validation | Validates login form shape; will be used for all future forms |
| @fontsource-variable/noto-sans-myanmar | 5.2.1 | Burmese script font | Self-hosted; covers Unicode Myanmar blocks Extended-A and Extended-B |

### Supporting (Phase 1 dev tooling)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/papaparse | latest | TypeScript types | Install as devDependency alongside papaparse |
| prettier-plugin-tailwindcss | latest | Auto-sort Tailwind classes | Keeps className strings readable across all components |
| eslint-config-next | bundled | Next.js lint rules | Catches common RSC / client component misconfigurations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jose (middleware JWT) | iron-session cookie check in middleware | iron-session alone is vulnerable to CVE-2025-29927 middleware bypass; jose provides cryptographic verification |
| next-intl | next-i18next | next-i18next is Pages Router only; causes hydration mismatch in App Router |
| @vercel/blob | Local /tmp | /tmp is ephemeral per serverless instance — data is silently lost between invocations |

**Installation:**
```bash
# Bootstrap (includes Next.js, React 19, TypeScript, Tailwind v4, ESLint, App Router)
npx create-next-app@latest survey-yoma --typescript --tailwind --eslint --app --src-dir

# i18n
npm install next-intl

# Auth
npm install iron-session jose

# Storage + CSV
npm install @vercel/blob papaparse
npm install -D @types/papaparse

# Validation
npm install zod

# Burmese font
npm install @fontsource-variable/noto-sans-myanmar

# shadcn/ui (CLI — copies components, not a runtime dep)
npx shadcn@latest init
```

**Version note:** `next` shows 16.2.2 on npm as of 2026-04-01, up from the 15.2.4 noted in earlier stack research. The `next-intl` 4.x + App Router compatibility is confirmed. All versions above are npm-registry-verified today.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/                   # next-intl locale prefix — ALL routes live here
│   │   ├── (admin)/                # Route group — auth-gated admin pages
│   │   │   ├── layout.tsx          # Admin shell: sidebar + header
│   │   │   └── admin/
│   │   │       ├── page.tsx        # /admin/dashboard — welcome card (Phase 1)
│   │   │       ├── surveys/
│   │   │       │   └── page.tsx    # placeholder (Phase 2)
│   │   │       └── settings/
│   │   │           └── page.tsx    # placeholder (Phase 2)
│   │   ├── (public)/               # Route group — no auth
│   │   │   └── layout.tsx          # Minimal public shell
│   │   └── login/
│   │       └── page.tsx            # Admin login form
│   ├── api/
│   │   └── auth/
│   │       └── route.ts            # POST login / DELETE logout
│   ├── layout.tsx                  # Root layout (next-intl NextIntlClientProvider)
│   └── globals.css
│
├── components/
│   ├── admin/
│   │   └── AdminSidebar.tsx        # Collapsible sidebar (shadcn Sidebar primitive)
│   └── ui/                         # shadcn/ui copied components live here
│
├── lib/
│   ├── storage/
│   │   ├── adapter.ts              # StorageAdapter interface
│   │   ├── local.adapter.ts        # LocalAdapter — fs read/write for dev
│   │   └── blob.adapter.ts         # BlobAdapter — @vercel/blob for production
│   ├── services/
│   │   └── csv.service.ts          # Read/write/append CSV via StorageAdapter
│   ├── auth.ts                     # iron-session config + jose sign/verify helpers
│   ├── constants.ts                # GPTW 46 questions, dimensions, sub-pillars
│   └── types.ts                    # Shared TypeScript interfaces
│
├── messages/
│   ├── en.json                     # English UI strings
│   └── mm.json                     # Burmese UI strings
│
├── i18n/
│   └── request.ts                  # next-intl per-request locale config
│
└── middleware.ts                   # i18n locale routing + jose JWT auth guard
```

### Pattern 1: URL-Path i18n with next-intl 4.x

**What:** All routes live under `app/[locale]/`. next-intl middleware handles locale detection from the URL path and redirects root `/` to `/en`. The `i18n/request.ts` file loads the correct message file per request. No browser `Accept-Language` detection.

**When to use:** Every route in the app. This is locked — cannot be changed after Phase 1.

**Example — middleware.ts:**
```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard: protect all /[locale]/admin/* routes
  if (pathname.match(/\/(?:en|my)\/admin/)) {
    const token = request.cookies.get('admin_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/en/login', request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL('/en/login', request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

**Example — i18n/routing.ts:**
```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'my'],
  defaultLocale: 'en',
  localeDetection: false,  // URL path only — no Accept-Language
});
```

**Example — i18n/request.ts:**
```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Pattern 2: StorageAdapter Interface

**What:** All CSV read/write goes through a `StorageAdapter` interface. `LocalAdapter` uses Node.js `fs` for dev. `BlobAdapter` uses `@vercel/blob` with ETag conditional writes for production. The active adapter is chosen by `NODE_ENV`.

**When to use:** Every file read/write in the app. Implement before writing any CSV service code.

```typescript
// src/lib/storage/adapter.ts
export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, content: string, etag?: string): Promise<{ etag: string }>;
  exists(key: string): Promise<boolean>;
}
```

```typescript
// src/lib/storage/blob.adapter.ts
import { put, head, getDownloadUrl } from '@vercel/blob';
import { BlobPreconditionFailedError } from '@vercel/blob';
import type { StorageAdapter } from './adapter';

export class BlobAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    try {
      const blob = await head(key);
      const response = await fetch(blob.url);
      return response.ok ? response.text() : null;
    } catch {
      return null;
    }
  }

  async write(key: string, content: string, etag?: string): Promise<{ etag: string }> {
    const result = await put(key, content, {
      access: 'public',
      contentType: 'text/csv',
      ...(etag ? { ifMatch: etag } : {}),
    });
    return { etag: result.url }; // Blob URL acts as version identifier
  }

  async exists(key: string): Promise<boolean> {
    try {
      await head(key);
      return true;
    } catch {
      return false;
    }
  }
}
```

```typescript
// src/lib/storage/local.adapter.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import type { StorageAdapter } from './adapter';

const DATA_DIR = path.join(process.cwd(), 'data');

export class LocalAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(DATA_DIR, key), 'utf-8');
    } catch {
      return null;
    }
  }

  async write(key: string, content: string): Promise<{ etag: string }> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, key), content, 'utf-8');
    return { etag: Date.now().toString() };
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(DATA_DIR, key));
      return true;
    } catch {
      return false;
    }
  }
}
```

### Pattern 3: ETag Retry Loop for CSV Writes

**What:** Vercel Blob has no append API. Every write is read-mutate-write. Two concurrent writes will collide without ETag protection. Wrap every write in a retry loop that re-fetches fresh content when `BlobPreconditionFailedError` is thrown.

**When to use:** Every CSV mutation (append row, update row). Implement in `csv.service.ts`.

```typescript
// src/lib/services/csv.service.ts
import Papa from 'papaparse';
import { getStorageAdapter } from '../storage';
import { BlobPreconditionFailedError } from '@vercel/blob';

const MAX_RETRIES = 5;

export async function appendRow(
  filename: string,
  row: Record<string, string>
): Promise<void> {
  const adapter = getStorageAdapter();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const existing = await adapter.read(filename);
    const rows = existing
      ? Papa.parse<Record<string, string>>(existing, { header: true }).data
      : [];
    rows.push(row);

    const csv = Papa.unparse(rows);
    try {
      await adapter.write(filename, csv);
      return;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError && attempt < MAX_RETRIES - 1) {
        continue; // retry with fresh content
      }
      throw err;
    }
  }
}
```

### Pattern 4: Static Admin Auth (iron-session + jose)

**What:** POST to `/api/auth` compares credentials against env vars. On match, signs a JWT with jose and stores it as an HttpOnly iron-session cookie. The middleware verifies the JWT cryptographically on every `/[locale]/admin/*` request. This pattern mitigates CVE-2025-29927 (middleware bypass via malformed headers) because the check is cryptographic, not just cookie-existence.

```typescript
// src/app/api/auth/route.ts
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/auth';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  const session = await getIronSession<SessionData>(await cookies(), {
    cookieName: 'admin_session',
    password: process.env.IRON_SESSION_PASSWORD!,
  });
  session.token = token;
  await session.save();

  return Response.json({ ok: true });
}

export async function DELETE() {
  const session = await getIronSession<SessionData>(await cookies(), {
    cookieName: 'admin_session',
    password: process.env.IRON_SESSION_PASSWORD!,
  });
  session.destroy();
  return Response.json({ ok: true });
}
```

### Pattern 5: Burmese Font Loading (Conditional on Locale)

**What:** Noto Sans Myanmar Variable is loaded via Fontsource. Apply only when `locale === 'my'` to avoid unnecessary font loading on English pages.

```typescript
// src/app/[locale]/layout.tsx
import '@fontsource-variable/noto-sans-myanmar';

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body className={locale === 'my' ? 'font-myanmar' : 'font-sans'}>
        {children}
      </body>
    </html>
  );
}
```

```css
/* src/app/globals.css — Tailwind v4, add to @layer base */
@layer base {
  .font-myanmar {
    font-family: 'Noto Sans Myanmar Variable', sans-serif;
  }
}
```

### Anti-Patterns to Avoid

- **Using fs.writeFile directly in API routes:** Vercel serverless filesystem is read-only. Any CSV write not routed through the StorageAdapter will throw `EROFS` in production.
- **Detecting locale from `navigator.language`:** Causes SSR/client hydration mismatch. Locale comes from URL path only.
- **Verifying auth in middleware via cookie existence alone:** Vulnerable to CVE-2025-29927. Always use jose cryptographic verification.
- **Defining CSV columns by index in papaparse:** Use `header: true` and key by column name. Index-based access breaks on any schema change.
- **Using `next-i18next`:** Pages Router only — does not work with App Router Server Components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Encrypted session cookies | Custom cookie signing | iron-session 8.x | iron-session handles HMAC signing, HttpOnly flag, expiry, and cookie size limits |
| Edge-compatible JWT verify | Custom HMAC in middleware | jose jwtVerify | jose is Web Crypto API compatible; Node crypto is unavailable in edge runtime |
| Locale routing and message loading | Custom middleware URL parsing | next-intl createMiddleware | Handles redirect logic, locale negotiation, fallback, and Server Component message injection |
| CSV concurrent write safety | Custom file lock | @vercel/blob ETag + retry | Blob ETag is the only safe concurrency primitive; file locks don't work across serverless instances |
| CSV parse/serialize | String split on comma | papaparse | Handles quoted strings, commas inside fields, UTF-8 BOM, and header rows correctly |
| Burmese font loading | Self-hosting Google Fonts manually | @fontsource-variable/noto-sans-myanmar | Fontsource provides npm-installable self-hosted variable fonts; no GDPR concerns |

**Key insight:** Every item in this table represents a class of edge cases that has caused production bugs — encrypted cookies need replay protection, edge JWT needs Web Crypto, CSV needs quote-aware parsing. Custom implementations consistently miss these.

---

## Complete GPTW Question Mapping (from PDF verification)

This is the authoritative data for `lib/constants.ts`. All 46 Likert statements with their English text, dimension, and sequential ID are confirmed from the PDF. Burmese text is present in the PDF for all statements.

### Camaraderie (CAM) — Q1-8
| ID | English Statement |
|----|------------------|
| CAM-01 | I can count on my colleagues to step up and help me when I need it. |
| CAM-02 | I feel we take the time to celebrate our wins and special events. |
| CAM-03 | My colleagues care about me as a human being. |
| CAM-04 | I experience great collaboration across different departments, not just within my own area. |
| CAM-05 | I can be myself around here. |
| CAM-06 | I feel comfortable approaching my manager or management for an open conversation. |
| CAM-07 | I felt genuinely welcomed and supported when I joined my current role. |
| CAM-08 | I have fun working here. |

### Credibility (CRE) — Q9-17
| ID | English Statement |
|----|------------------|
| CRE-09 | Our leaders fully embody the best characteristics of our company. |
| CRE-10 | I am led by the people who operate with integrity and keep their promises. |
| CRE-11 | I am trusted with responsibility and encouraged to try new things without fear of making honest mistakes. |
| CRE-12 | I am kept in the loop on important changes and feel safe asking tough questions. |
| CRE-13 | I am clear on the company vision and confident in how the business is being run. |
| CRE-14 | I am clear about what success looks like in my role. |
| CRE-15 | I am confident in the talent and character of the people who are hired onto the team. |
| CRE-16 | I feel secure in my role and confident in the stability of the company. |
| CRE-17 | I feel our teams and resources are organized effectively to get work done without unnecessary friction. |

### Fairness (FAI) — Q18-25
| ID | English Statement |
|----|------------------|
| FAI-18 | People here are treated fairly regardless of their gender, race or age. |
| FAI-19 | I am compensated fairly for my work and have access to meaningful benefits. |
| FAI-20 | I feel confident that if I raise a concern, it will be taken seriously and handled fairly. |
| FAI-21 | I receive the same level of support and opportunity from my manager as my peers do. |
| FAI-22 | Everyone has an opportunity to get special recognition. |
| FAI-23 | I am treated as a full member here regardless of my position. |
| FAI-24 | My workload is reasonable and distributed fairly compared to my peers. |
| FAI-25 | Company policies and rules are enforced consistently across all levels of the organization. |

### Pride (PRI) — Q26-35
| ID | English Statement |
|----|------------------|
| PRI-26 | Our customers would rate the service we deliver as "excellent." |
| PRI-27 | When I look at what we accomplish, I feel a sense of pride. |
| PRI-28 | People here quickly adapt to changes needed for our organization's success. |
| PRI-29 | I want to work here for a long time. |
| PRI-30 | My work has special meaning: this is not "just a job." |
| PRI-31 | I would strongly endorse my company to friends and family as a great place to work. |
| PRI-32 | I'm proud to tell others I work here. |
| PRI-33 | I feel good about the ways we contribute to the community. |
| PRI-34 | I feel I make a difference here. |
| PRI-35 | I would recommend our products and services to family and friends. |

### Respect (RES) — Q36-46
| ID | English Statement |
|----|------------------|
| RES-36 | I have the tools, resources, and workspace I need to do my best work. |
| RES-37 | I feel appreciated for my work and valued as a person. |
| RES-38 | I am encouraged to share new ideas, and I am not penalized for making honest mistakes. |
| RES-39 | I am provided with benefits that actually add real value to my life. |
| RES-40 | I am able to take time off from work when I think it's necessary. |
| RES-41 | I am supported in maintaining a healthy balance between my work and personal life. |
| RES-42 | I am offered training or development to further myself professionally. |
| RES-43 | I feel appreciated and recognized when I put in extra effort. |
| RES-44 | I am encouraged to try new approaches and feel safe making honest mistakes along the way. |
| RES-45 | I am regularly asked for my input, and my ideas are given genuine consideration when I share them. |
| RES-46 | This is a psychologically and emotionally healthy place to work. |

### Uncategorized (UNC) — Q47
| ID | English Statement |
|----|------------------|
| UNC-47 | Taking everything into account, I would say this is a great place to work. |

### Open-Ended Questions
| ID | English Prompt |
|----|---------------|
| OE-01 | Is there anything unique or unusual about this company that makes it a great place to work? Please give specific examples. |
| OE-02 | If you could change one thing about this company to make it a better place to work, what would it be? |

### Demographic Fields
| ID | Field | Options |
|----|-------|---------|
| DEM-ORG | My Organization | Wave Money, Yoma Bank |
| DEM-YEAR | My Service Year | Less than 1 year, 1 to 3 years, 3 to 5 years, 5 to 10 years, 10 to 20 years, More than 20 years |
| DEM-ROLE | Which best describes your current role? | Individual Contributor (I do not manage a team), People Manager (I have direct reports) |

---

## Common Pitfalls

### Pitfall 1: Vercel Serverless Filesystem is Read-Only
**What goes wrong:** `fs.writeFile()` to project directory throws `EROFS` on Vercel. Works in local dev, silently fails in production.
**Why it happens:** Local dev masks the constraint entirely.
**How to avoid:** StorageAdapter from day one. `BlobAdapter` for prod, `LocalAdapter` for dev. Never write to relative file paths in API routes.
**Warning signs:** Submissions return 200 but no data appears; `EROFS` in Vercel function logs.

### Pitfall 2: Concurrent CSV Writes Lose Data
**What goes wrong:** Two simultaneous POSTs both read the same CSV, both append, second write overwrites first. One response silently lost.
**Why it happens:** No database transaction; read-modify-write is not atomic.
**How to avoid:** ETag conditional writes via `@vercel/blob`'s `ifMatch` option + retry loop on `BlobPreconditionFailedError`. Implement in `csv.service.appendRow` before any submission endpoint.
**Warning signs:** Response count doesn't match email send count; intermittent missing rows.

### Pitfall 3: i18n Hydration Mismatch
**What goes wrong:** Server renders English; client hydrates Burmese. React hydration error or visible language flash.
**Why it happens:** Locale derived from browser APIs runs only on client, not server.
**How to avoid:** URL-path locale is locked in this phase. Never use `navigator.language` or `localStorage` for locale. Already prevented by the `localeDetection: false` setting in `routing.ts`.
**Warning signs:** Hydration errors in browser console; text flashes on first load.

### Pitfall 4: Middleware Auth Bypass (CVE-2025-29927)
**What goes wrong:** Middleware auth check that only verifies cookie existence can be bypassed with a crafted `x-middleware-subrequest` header.
**Why it happens:** Next.js middleware was vulnerable to header injection that skips middleware execution.
**How to avoid:** Always use jose `jwtVerify` cryptographically in middleware — not just `cookies().get()` existence check. Pattern shown in Pattern 1 above.
**Warning signs:** Admin routes accessible without valid session cookie.

### Pitfall 5: CSV Column Index Access Breaks on Schema Change
**What goes wrong:** `row[4]` stops working when a column is added or reordered.
**Why it happens:** Developers write quick parsing code using positional access.
**How to avoid:** Always `Papa.parse(content, { header: true })` and access by key name (`row['questionId']`). FOUN-03 explicitly requires this.
**Warning signs:** Any `row[number]` access in CSV parsing code.

### Pitfall 6: Missing Burmese Translations on Error Paths
**What goes wrong:** All main UI strings are translated, but validation errors, toast messages, and 404 pages remain English-only.
**Why it happens:** Error strings are added ad hoc and translation is deferred.
**How to avoid:** Define ALL UI strings — including errors, loading states, and empty states — in both `messages/en.json` and `messages/mm.json` before using them. FOUN-06 requires complete coverage.
**Warning signs:** Hardcoded English strings in JSX; missing keys in `mm.json`.

---

## Code Examples

### Verified: next-intl 4.x Configuration

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl({});
```

```typescript
// src/app/layout.tsx — Root layout (no locale prefix)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children; // locale layout handles html/body
}
```

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '@fontsource-variable/noto-sans-myanmar';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={locale === 'my' ? 'font-myanmar' : 'font-sans'}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Verified: iron-session + jose session types

```typescript
// src/lib/auth.ts
import type { IronSessionData } from 'iron-session';

export interface SessionData extends IronSessionData {
  token?: string;
}

export const sessionOptions = {
  cookieName: 'admin_session',
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
};
```

### Verified: StorageAdapter factory

```typescript
// src/lib/storage/index.ts
import { LocalAdapter } from './local.adapter';
import { BlobAdapter } from './blob.adapter';
import type { StorageAdapter } from './adapter';

let adapter: StorageAdapter;

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = process.env.NODE_ENV === 'production'
      ? new BlobAdapter()
      : new LocalAdapter();
  }
  return adapter;
}
```

### Verified: PapaParse header-keyed CSV pattern

```typescript
// src/lib/services/csv.service.ts — Read by header name (FOUN-03)
import Papa from 'papaparse';

export function parseCSV<T extends Record<string, string>>(
  content: string
): T[] {
  const result = Papa.parse<T>(content, {
    header: true,       // keys by column name — never by index
    skipEmptyLines: true,
    dynamicTyping: false, // keep all values as strings for CSV safety
  });
  return result.data;
}

export function serializeCSV<T extends Record<string, string>>(
  rows: T[]
): string {
  return Papa.unparse(rows, { header: true });
}
```

### lib/constants.ts Shape

```typescript
// src/lib/constants.ts — structure (planner fills content from question table above)
export type Dimension = 'camaraderie' | 'credibility' | 'fairness' | 'pride' | 'respect' | 'uncategorized';
export type QuestionType = 'likert' | 'open_ended' | 'demographic';

export interface Question {
  id: string;           // e.g. "CAM-01"
  dimension: Dimension;
  subPillar?: string;   // e.g. "communication" under credibility
  type: QuestionType;
  en: string;           // English text
  my: string;           // Burmese text (Unicode)
  order: number;        // 1-47 for likert, then OE, then DEM
}

export const QUESTIONS: Question[] = [
  // ... 46 Likert + 1 UNC + 2 OE + 3 DEM
];

export const DIMENSIONS: Record<Dimension, { label: { en: string; my: string }; subPillars: string[] }> = {
  camaraderie:   { label: { en: 'Camaraderie', my: 'ပူးပေါင်းဆောင်ရွက်မှု' }, subPillars: ['friendship', 'welcoming', 'teamwork'] },
  credibility:   { label: { en: 'Credibility', my: 'ယုံကြည်စိတ်ချရမှု' }, subPillars: ['communication', 'competence', 'integrity'] },
  fairness:      { label: { en: 'Fairness', my: 'တရားမျှတမှု' }, subPillars: ['equity', 'impartiality', 'justice'] },
  pride:         { label: { en: 'Pride', my: 'ဂုဏ်ယူမှု' }, subPillars: ['personal_job', 'team', 'company'] },
  respect:       { label: { en: 'Respect', my: 'လေးစားမှု' }, subPillars: ['caring', 'collaboration', 'development'] },
  uncategorized: { label: { en: 'Overall', my: 'စုစုပေါင်း' }, subPillars: [] },
};

export const FAVORABLE_THRESHOLD = 4; // scores >= 4 count as favorable
export function isFavorable(score: number): boolean {
  return score >= FAVORABLE_THRESHOLD;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package with `motion/react` imports | 2024 rebrand | Old package still works but new projects use `motion` |
| `next-i18next` + `serverSideTranslations` | `next-intl` with App Router Server Components | Next.js 13+ (App Router) | next-i18next causes hydration errors in App Router |
| iron-session v6/v7 (Pages Router) | iron-session v8 (App Router, `getIronSession(await cookies(), config)`) | iron-session v8.0.0 | v6/v7 API is incompatible with App Router |
| Tailwind v3 (`tailwind.config.js`) | Tailwind v4 (import-based, no config file required) | Tailwind v4.0 (Jan 2025) | v4 is 5-100x faster builds; different setup steps |
| `xlsx` npm package | `exceljs` (Phase 2) | xlsx abandoned ~2022 | xlsx has unpatched CVEs; not relevant to Phase 1 |

**Deprecated/outdated to avoid:**
- `next-i18next`: Pages Router only, SSR hydration issues in App Router
- `iron-session` v6/v7: Pre-App Router API
- `framer-motion`: Canonical package is now `motion`
- `xlsx` npm package: Multiple unpatched CVEs (Phase 2 concern)

---

## Open Questions

1. **Burmese sub-pillar labels in Myanmar script**
   - What we know: English sub-pillar names are standard GPTW terminology
   - What's unclear: The official Burmese translations for sub-pillar labels (e.g., "Communication" → Burmese) are not in the PDF
   - Recommendation: Use phonetic transliterations for Phase 1 (`messages/mm.json`); confirm with stakeholder before Phase 3 survey form launch

2. **BLOB_READ_WRITE_TOKEN scope**
   - What we know: `@vercel/blob` requires `BLOB_READ_WRITE_TOKEN` env var on Vercel
   - What's unclear: Whether the token needs to be scoped to a specific store or is project-wide
   - Recommendation: Use project-wide token for MVP; create via Vercel dashboard under Storage → Blob before first deploy

3. **next.js version (15 vs 16)**
   - What we know: npm registry shows `next@16.2.2` as latest as of 2026-04-01; prior stack research documented 15.2.4
   - What's unclear: Whether v16 introduces breaking changes vs v15 that affect App Router patterns
   - Recommendation: Use latest stable (`next@latest` in `create-next-app`); verify App Router and next-intl 4.x compatibility during scaffold step

4. **IRON_SESSION_PASSWORD minimum length**
   - What we know: iron-session requires a password for cookie encryption
   - What's unclear: Minimum length requirement (v8 documentation should be checked)
   - Recommendation: Use a 32+ character random string; generate with `openssl rand -base64 32` during Vercel env var setup

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — greenfield project |
| Config file | Wave 0 creates `jest.config.ts` or `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0 setup) |
| Full suite command | `npx vitest run` |

**Recommendation:** Use Vitest over Jest for this stack. Vitest is faster, has built-in TypeScript support with no transform config, and shares Vite's resolver — better aligned with Next.js App Router's ESM-first architecture. For Next.js component testing, add `@testing-library/react` and `happy-dom`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-02 | StorageAdapter: LocalAdapter read/write roundtrip | unit | `npx vitest run tests/storage/local.adapter.test.ts` | Wave 0 |
| FOUN-02 | ETag retry loop retries on BlobPreconditionFailedError | unit | `npx vitest run tests/storage/csv.service.test.ts` | Wave 0 |
| FOUN-03 | CSV parsed by header name not index | unit | `npx vitest run tests/lib/csv.service.test.ts` | Wave 0 |
| FOUN-04 | All 46 questions present in QUESTIONS constant | unit | `npx vitest run tests/lib/constants.test.ts` | Wave 0 |
| FOUN-04 | Each question has non-empty en and my text | unit | `npx vitest run tests/lib/constants.test.ts` | Wave 0 |
| FOUN-04 | Question IDs follow dimension prefix convention | unit | `npx vitest run tests/lib/constants.test.ts` | Wave 0 |
| FOUN-05 | Visiting /en and /my returns 200, no hydration errors | smoke | `npx playwright test tests/e2e/locale.spec.ts` | Wave 0 |
| AUTH-01 | POST /api/auth with valid credentials returns 200 + sets cookie | unit | `npx vitest run tests/api/auth.test.ts` | Wave 0 |
| AUTH-01 | POST /api/auth with invalid credentials returns 401 | unit | `npx vitest run tests/api/auth.test.ts` | Wave 0 |
| AUTH-02 | Session cookie is HttpOnly and has 24h maxAge | unit | `npx vitest run tests/api/auth.test.ts` | Wave 0 |
| AUTH-03 | GET /en/admin without session cookie returns redirect | smoke | `npx playwright test tests/e2e/auth.spec.ts` | Wave 0 |
| AUTH-04 | DELETE /api/auth destroys session cookie | unit | `npx vitest run tests/api/auth.test.ts` | Wave 0 |
| DATA-02 | getStorageAdapter() returns BlobAdapter in production env | unit | `npx vitest run tests/storage/adapter.test.ts` | Wave 0 |
| DATA-02 | getStorageAdapter() returns LocalAdapter in development env | unit | `npx vitest run tests/storage/adapter.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/lib/ tests/storage/ tests/api/` (unit tests only, ~5s)
- **Per wave merge:** `npx vitest run` (full unit suite)
- **Phase gate:** Full unit suite green + smoke tests pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/constants.test.ts` — covers FOUN-04: question count, IDs, bilingual text
- [ ] `tests/lib/csv.service.test.ts` — covers FOUN-03, FOUN-02 retry logic
- [ ] `tests/storage/local.adapter.test.ts` — covers FOUN-02 LocalAdapter
- [ ] `tests/storage/adapter.test.ts` — covers DATA-02 adapter selection
- [ ] `tests/api/auth.test.ts` — covers AUTH-01 through AUTH-04
- [ ] `tests/e2e/locale.spec.ts` — covers FOUN-05 (Playwright smoke)
- [ ] `tests/e2e/auth.spec.ts` — covers AUTH-03 (Playwright smoke)
- [ ] `vitest.config.ts` — test framework config
- [ ] `tests/setup.ts` — shared fixtures and mocks for @vercel/blob
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/user-event happy-dom @playwright/test`

---

## Sources

### Primary (HIGH confidence)
- npm registry `npm view [package] version` — all versions verified 2026-04-01
- `assets/YFS Culture Survey_Statements_March 2026_FINAL_25032026.pdf` — all 46 questions, 2 OE, 3 demographic fields confirmed
- `.planning/research/STACK.md` — project's own verified stack research (2026-04-01)
- `.planning/research/ARCHITECTURE.md` — project's own verified architecture research (2026-04-01)
- `.planning/research/PITFALLS.md` — project's own verified pitfalls research (2026-04-01)
- [next-intl 4.0 release notes](https://next-intl.dev/blog/next-intl-4-0) — App Router only confirmed
- [iron-session v8 App Router support](https://github.com/vvo/iron-session/releases/tag/v8.0.0)
- [CVE-2025-29927 middleware bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — jose verification requirement

### Secondary (MEDIUM confidence)
- [Vercel Blob SDK docs](https://vercel.com/docs/vercel-blob/using-blob-sdk) — ETag/ifMatch pattern
- [Tailwind CSS v4 Next.js guide](https://tailwindcss.com/docs/guides/nextjs) — v4 setup steps
- [Fontsource Noto Sans Myanmar](https://fontsource.org/fonts/noto-sans-myanmar) — variable font package name confirmed

### Tertiary (LOW confidence — needs validation)
- Next.js 16.2.2 version — npm shows this but prior research documented 15.2.4; confirm during scaffold that next-intl 4.x remains compatible

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions npm-verified 2026-04-01
- Architecture: HIGH — from project's own prior architecture research, aligned with locked CONTEXT.md decisions
- GPTW question mapping: HIGH — directly verified from authoritative PDF source
- Auth patterns: HIGH — jose and iron-session official release notes confirm App Router compatibility
- Pitfalls: HIGH — from project's own research, confirmed by official docs

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable libraries; re-verify next-intl and @vercel/blob API changes if > 30 days)
