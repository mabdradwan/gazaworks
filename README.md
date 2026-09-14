# GazaWorks

Production-oriented professional marketplace foundation connecting verified Gaza talent and teams with international clients. It includes a responsive multilingual Next.js application, Supabase/PostgreSQL data platform, strict RLS, core marketplace workflows, financial invariants, moderation, RBAC, CMS, provider-neutral AI and payment adapters, and critical domain tests.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

The marketing application works without credentials. Authenticated/data-backed flows require a Supabase project and the migrations in `supabase/migrations`. Run `supabase db reset` for a local Supabase environment. Mock AI and payments are deliberately marked as development-only and never represent real external actions.

## Quality gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

See `docs/BUILD_STATUS.md` for the precise implementation boundary and external requirements.
