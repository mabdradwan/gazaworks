# GazaWorks

Production-oriented professional marketplace foundation connecting verified Gaza talent and teams with international clients. It includes a responsive multilingual Next.js application, Supabase/PostgreSQL data platform, strict RLS, core marketplace workflows, financial invariants, moderation, RBAC, CMS, provider-neutral AI and payment adapters, and critical domain tests.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

The homepage works without credentials. Authenticated/data-backed flows require a Supabase project and the migrations in `supabase/migrations`. Run `supabase db reset` for a local Supabase environment. AI is unavailable until a real provider is configured. Payment simulation is explicitly development-only and never represents a real transfer.

## Quality gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

See `docs/BUILD_STATUS.md` for the precise implementation boundary and external requirements.


## Release status

The `work` branch is under review in [draft PR #4](https://github.com/mabdradwan/gazaworks/pull/4). Its latest migrations have not been applied to the live site. Coordinate the database and application upgrade; see [deployment instructions](docs/DEPLOYMENT.md). This is not a production-completion claim.

- [Architecture](docs/ARCHITECTURE.md) and [database model](docs/DATABASE.md)
- [Product requirements](docs/product-requirements.md) and [development roadmap](docs/development-roadmap.md)
- [Security model](docs/SECURITY.md), [payment architecture](docs/PAYMENTS.md), [AI architecture](docs/AI.md)
- [Important email setup](docs/EMAIL.md) and [existing database baseline](docs/MIGRATION_BASELINE.md)
- [Verified build status and remaining work](docs/BUILD_STATUS.md)

The guarded development seed is `scripts/seed-users.mjs`; run it only against an isolated development project as described in the deployment guide.
