# Deployment

GitHub `main` is the source of truth. Netlify is the production deployment platform; Vercel is not part of the active deployment path.

1. Review `docs/MIGRATION_BASELINE.md` and the private 2026-09-30 recovery archive before any further database change. The five integrated migrations have been applied to production, but their connector-assigned versions differ from repository filenames, as do the historical `0001`–`0010` versions. Reconcile this history on an isolated database before enabling automated `db push`. Supabase Free does not provide automatic backups. Never use `supabase db reset` or a blind `db push` on production.
2. Configure Netlify environment variables from `.env.example`. Keep `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `BREVO_API_KEY`, `BREVO_WEBHOOK_TOKEN`, and `GEMINI_API_KEY` server-only and never expose them through `NEXT_PUBLIC_*`. Brevo delivery additionally needs a verified sender, `EMAIL_PROVIDER=brevo`, `EMAIL_DELIVERY_ENABLED=true`, and `NEXT_PUBLIC_APP_URL=https://gazaworks.netlify.app` or the chosen domain. Contact mail separately needs `CONTACT_RECIPIENT_EMAIL`. Configure a Brevo transactional webhook with bearer authentication matching `BREVO_WEBHOOK_TOKEN` and URL `/api/webhooks/email` before claiming delivery tracking.
3. The authentication UI performs a read-only `gw_auth_runtime_ready()` probe with the server credential. This marker is installed by the final integrated migration and callable only by `service_role`; until the database and secret are ready, registration, sign-in and OAuth actions are paused with a clear six-language notice. Netlify builds with `npm run build` and the Next.js plugin defined in `netlify.toml`. Production deploys are sourced from GitHub `main`.
4. Netlify Scheduled Functions in `netlify/functions/` invoke the protected auto-accept, dispute-finalization and, only when enabled, Brevo email-outbox API routes. Their schedules are defined in code and run in UTC.
5. Verify Supabase Auth site/redirect URLs, Google OAuth configuration if enabled, email delivery, custom domain, monitoring, backups, rate limiting, storage scanning and retention before public launch.
6. Keep `PAYMENT_PROVIDER=disabled` and `AI_PROVIDER=disabled` unless a permitted Gemini API key has been configured. `PAYMENT_PROVIDER=mock` is an optional local development simulator only and cannot run on a Netlify production build. Do not activate a Bank of Palestine adapter until its technical contract and the required legal/banking controls exist.

Health probes use `GET /api/health`. Deploy previews must use isolated data where possible and must keep real payment processing disabled.

## Legacy Vercel configuration

`vercel.json` is retained only as historical/reference configuration for the former cron setup. Netlify does not read it, and new deployment work must not depend on Vercel. Remove it only after confirming no external workflow still references it.
