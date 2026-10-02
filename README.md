# GazaWorks

Production-oriented professional marketplace foundation connecting verified Gaza talent and teams with international clients. It includes a responsive multilingual Next.js application, Supabase/PostgreSQL data platform, strict RLS, core marketplace workflows, financial invariants, moderation, RBAC, CMS, provider-neutral AI and payment adapters, and critical domain tests.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

The marketing application works without credentials. Authenticated/data-backed flows require a Supabase project and the migrations in `supabase/migrations`. Run `supabase db reset` only on a disposable local environment. The connected production migration history differs from repository filenames; see `docs/MIGRATION_BASELINE.md` before an in-place upgrade. The example configuration disables AI, email delivery and payments. The optional payment simulator runs only outside production with `PAYMENT_PROVIDER=mock` and local development mode or explicit nonproduction authorization. Mock AI output is never published.

## Quality gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

See `docs/BUILD_STATUS.md` for the precise implementation boundary and external requirements.

With an empty disposable PostgreSQL database, `TEST_DATABASE_URL=postgresql://... bash scripts/test-database.sh` exercises schema creation, in-place upgrade, RLS and transaction races. The script refuses a populated database.

## Current integration state (September 2026)

`docs/INTEGRATION_STATUS_2026-09-30.md` records the current release gates. Authentication is deliberately paused until the integrated database schema and server-only credential pass a read-only readiness probe. A Google or Brevo browser login does not supply a server API credential. No live payment processing is enabled; the Bank of Palestine gateway is shown as an inactive client payment option. Provision keys through deployment server secrets, never in chat.
