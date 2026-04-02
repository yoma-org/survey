# Culture Survey (survey-yoma)

Next.js 16 + React 19 + Drizzle ORM + PostgreSQL + next-intl (en/my)

@AGENTS.md

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run tests (vitest)
pnpm test:watch       # Watch mode
pnpm lint             # ESLint
npx drizzle-kit push  # Push schema to DB
npx drizzle-kit generate  # Generate migrations
```

## Architecture

- `src/app/api/` — REST API routes (auth, surveys, settings)
- `src/app/[locale]/` — Internationalized pages (en, my)
- `src/app/[locale]/(admin)/` — Protected admin dashboard
- `src/app/[locale]/survey/[token]/` — Public survey form (token-based access)
- `src/components/` — UI components (admin, survey, charts, shadcn ui/)
- `src/lib/db/` — Drizzle schema & lazy-init connection
- `src/lib/services/` — Business logic layer (analytics, email, token, csv, etc.)
- `src/lib/validation/` — Zod schemas
- `src/lib/constants.ts` — 47 GPTW questions, dimension mappings
- `src/lib/diagnostic-framework.ts` — Relationship & eNPS scoring logic
- `messages/` — i18n JSON files (en.json, my.json)
- `__tests__/` — Vitest tests (services mocked, node env)

## Environment Variables

Required: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `IRON_SESSION_PASSWORD` (>=32 chars), `DATABASE_URL` or `POSTGRES_URL`, `NEXT_PUBLIC_BASE_URL`
Optional: `BLOB_READ_WRITE_TOKEN` (Vercel Blob, production)

## Gotchas

- Route params are async in Next.js 16: `const { id } = await params`
- `revalidateTag(tag, 'default')` requires profile parameter
- DB connection uses lazy proxy — safe during build, but don't import raw `postgres` directly
- SMTP settings are singleton (id=1); analytics anonymity threshold = 5 responses
- Token generation is idempotent — same email+survey returns existing token
- No auth middleware; API routes check session individually
