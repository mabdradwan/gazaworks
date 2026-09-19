# Deployment

GitHub `main` is the source of truth. Netlify is the production deployment platform; Vercel is not part of the active deployment path.

1. Apply the committed Supabase migrations in `supabase/migrations` in order and seed required taxonomy/RBAC data. The connected production database currently includes migrations `0001` through `0010`.
2. Configure Netlify environment variables from `.env.example`. Keep `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` server-only and never expose them through `NEXT_PUBLIC_*`.
3. Netlify builds with `npm run build` and the Next.js plugin defined in `netlify.toml`. Production deploys are sourced from GitHub `main`.
4. Netlify Scheduled Functions in `netlify/functions/` invoke the protected auto-accept and dispute-finalization API routes. Their schedules are defined in code and run in UTC.
5. Verify Supabase Auth site/redirect URLs, Google OAuth configuration if enabled, email delivery, custom domain, monitoring, backups, rate limiting, storage scanning and retention before public launch.
6. Keep `PAYMENT_PROVIDER=mock` until an approved payment provider and the required legal/banking controls exist.

Health probes use `GET /api/health`. Deploy previews must use isolated data where possible and must keep real payment processing disabled.

## Legacy Vercel configuration

`vercel.json` is retained only as historical/reference configuration for the former cron setup. Netlify does not read it, and new deployment work must not depend on Vercel. Remove it only after confirming no external workflow still references it.
