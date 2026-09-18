# Setup and deployment

## Local application

Use Node 22 or newer and the committed lockfile:

```bash
cp .env.example .env.local
npm install
npm run dev
```

The homepage can render without Supabase credentials. Data-backed pages require a configured project. Use a separate development Supabase project or a local Supabase stack, never live customer data for seeded tests.

For a local Supabase stack with the Supabase CLI and Docker installed, consult `supabase --help` and `supabase start --help`, then run `supabase start` and `supabase db reset`. Reset applies migrations and `supabase/seed.sql`. Obtain the local URL/keys from `supabase status` and put them in `.env.local`.

For an **empty** hosted development project, use the Supabase CLI's current `link` and `db push` workflow after inspecting `--help`, or apply the checked-in migrations in filename order through your controlled migration process. Then run `supabase/seed.sql`. Never run reset on the connected live project. Its applied timestamp history differs from this repository; read [MIGRATION_BASELINE.md](MIGRATION_BASELINE.md) before any in-place upgrade.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public project URL and browser-safe publishable/legacy anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: server only. Required for authenticated workflow endpoints; never put it in browser code or a `NEXT_PUBLIC_` variable.
- `NEXT_PUBLIC_APP_URL`: canonical application origin.
- `CRON_SECRET`: long random secret used by the timer and email worker endpoints.
- `AI_PROVIDER=disabled` by default. For real drafting use `openai`, `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `OPENAI_MODEL`. The endpoint must support Chat Completions and JSON object responses for structured drafts. Missing credentials return unavailable, not invented output.
- `PAYMENT_PROVIDER=mock`: development simulator only. It never charges a card or moves money. `ALLOW_PAYMENT_SIMULATOR=true` is additionally required in a production-mode preview build; `VERCEL_ENV=production` always blocks simulation.

Important account email has a separate private queue and adapter; configure it using [EMAIL.md](EMAIL.md). It is disabled by default.

Configure Google OAuth inside Supabase, Auth email delivery, confirmation, password reset and allowed Auth redirect URLs. Add the exact `/auth/callback` URL for each allowed local/staging/production origin. Complete the hosted flows manually before release.

## Administrator and fictional fixtures

Register the intended owner normally, then run in a secure shell using server-only environment values:

```bash
node --env-file=.env.local scripts/bootstrap-admin.mjs owner@example.com
```

The script assigns the seeded Super Admin role; it does not create or email credentials.

For an isolated development project, set `ALLOW_DEMO_SEED=true`, a private `DEMO_PASSWORD` of at least 16 characters, and `DEMO_PROJECT_REF` for a hosted development target. Then:

```bash
node --env-file=.env.local scripts/seed-users.mjs
```

This creates eight fictional accounts, including individuals, teams, client, owner, moderator and verification officer. Emails end in `@gazaworks.test.invalid`. The example project awaits simulated funding. The script refuses production environments and the currently connected live project. No shared password is committed or printed.

## Automated checks

```bash
npm run check
```

Database tests require an **empty disposable PostgreSQL 17 database**:

```bash
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5432/gazaworks_test bash scripts/test-database.sh
```

The harness requires Python 3 and psql, creates test Auth/Storage fixtures, applies all migrations and seeds, and rolls back the main workflow fixtures. The final scheduling/email concurrency tests retain only synthetic rows until the disposable database is destroyed. Do not run it against an existing Supabase database. GitHub Actions provisions this disposable database automatically and runs typecheck, lint, Vitest and build.

## Coordinated rollout

1. Provision a separate staging Supabase project, apply all migrations and seed only safe taxonomy/RBAC. Set staging environment values in Vercel. Keep simulator data isolated.
2. Build the `work` branch and confirm CI for the exact source commit. The existing branch preview is protected; authorized browser access is required for acceptance testing.
3. Exercise every real Auth, Storage, Realtime and administrative journey with separate fictional accounts. See `BUILD_STATUS.md` for unfinished areas.
4. Before a live upgrade, reconcile the migration-history mismatch described in [MIGRATION_BASELINE.md](MIGRATION_BASELINE.md), then back up and audit existing data for duplicate projects/payouts/bookings, inconsistent states, and unbalanced journals, staff calendar conflicts and legacy completed interviews without attendance records. Do not invent attendance for historical records; review them before verification. The new unique constraints intentionally reject inconsistent data; reconcile it rather than deleting records.
5. Enter a controlled maintenance window. Apply missing migrations **auth security, atomic workflows and transactional email** in the reviewed baseline order, run the idempotent taxonomy/RBAC `supabase/seed.sql` (never fictional-user seeding), then immediately deploy the matching tested application. The old main application uses writes that the atomic migration revokes. Do not apply these grants/revocations independently of application rollout.
6. Validate Auth redirects, RLS, signed files, role permissions, critical workflows and scheduler execution against the deployed environment. Run Supabase security advisors and investigate new findings.
7. End maintenance only after acceptance checks pass. If deployment fails, keep maintenance active and fix forward or restore the coordinated database/application backup. Reverting only the application would leave incompatible permissions.

## Timers and operations

Both authenticated `GET`/`POST /api/cron/auto-accept` and `/api/cron/finalize-disputes` run the same idempotent timer engine. `Authorization: Bearer <CRON_SECRET>` is mandatory. The checked-in Vercel schedules run daily, so execution may lag a deadline by almost 24 hours. Configure a supported scheduler at a shorter cadence (for example, every five minutes) before claiming prompt 72-hour release/12-hour finalization. Never expose the cron secret in client requests.

`GET /api/health` is a basic probe, not a test of bank/AI connectivity. Configure the separate email scheduler and signed callbacks in [EMAIL.md](EMAIL.md). Add backup monitoring, job failure alerts, email delivery monitoring, malware processing and retention controls before launch.

## Payments and AI release

No real payment adapter is activated. Provider/bank/legal/accounting approval, signed webhooks, refunds and reconciliation must be completed before enabling third-party money custody. Set up the real AI provider only after reviewing data processing and retention terms for private CVs; AI cannot approve verification, resolve disputes or release money.
