# Deployment

GitHub `main` is the source of truth. Netlify is the production deployment platform; Vercel is not part of the active deployment path.

1. On a disposable database, run `scripts/test-database.sh` and review `docs/MIGRATION_BASELINE.md`. The connected production project already contains migrations corresponding to `0001`–`0010` under different timestamp versions. Rehearse and compare an in-place upgrade before applying only the missing migrations in a coordinated release. Never use `supabase db reset` or a blind `db push` on production.
2. Configure Netlify environment variables from `.env.example`. Keep `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `BREVO_API_KEY`, `BREVO_WEBHOOK_TOKEN`, and `GEMINI_API_KEY` server-only and never expose them through `NEXT_PUBLIC_*`. Brevo delivery additionally needs a verified sender, `EMAIL_PROVIDER=brevo`, `EMAIL_DELIVERY_ENABLED=true`, and `NEXT_PUBLIC_APP_URL=https://gazaworks.netlify.app` or the chosen domain. Contact mail separately needs `CONTACT_RECIPIENT_EMAIL`. Configure a Brevo transactional webhook with bearer authentication matching `BREVO_WEBHOOK_TOKEN` and URL `/api/webhooks/email` before claiming delivery tracking.
3. Netlify builds with `npm run build` and the Next.js plugin defined in `netlify.toml`. Production deploys are sourced from GitHub `main`.
4. Netlify Scheduled Functions in `netlify/functions/` invoke the protected auto-accept, dispute-finalization and, only when enabled, Brevo email-outbox API routes. Their schedules are defined in code and run in UTC.
5. Verify Supabase Auth site/redirect URLs, Google OAuth configuration if enabled, email delivery, custom domain, monitoring, backups, rate limiting, storage scanning and retention before public launch.
6. Keep `PAYMENT_PROVIDER=disabled` and `AI_PROVIDER=disabled` unless a permitted Gemini API key has been configured. `PAYMENT_PROVIDER=mock` is an optional local development simulator only and cannot run on a Netlify production build. Do not activate a Bank of Palestine adapter until its technical contract and the required legal/banking controls exist.

Health probes use `GET /api/health`. Deploy previews must use isolated data where possible and must keep real payment processing disabled.

## Legacy Vercel configuration

`vercel.json` is retained only as historical/reference configuration for the former cron setup. Netlify does not read it, and new deployment work must not depend on Vercel. Remove it only after confirming no external workflow still references it.
