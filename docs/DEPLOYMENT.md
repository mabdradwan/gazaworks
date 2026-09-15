# Deployment

1. Provision Supabase in the desired jurisdiction, apply migrations, seed taxonomy/RBAC, and create fictional development Auth users only outside production.
2. Configure Vercel environment variables from `.env.example`; keep service-role and cron values server-only.
3. Run `npm run check`, deploy, add a scheduler for `POST /api/cron/auto-accept`, and verify email/Google Auth redirect URLs.
4. Configure custom domain, transactional email, CAPTCHA, durable rate limiting, monitoring, backups, storage malware scanning and retention.
5. Before financial launch, install an approved `PaymentProvider`, complete legal/custody/KYC review, validate signed webhook events, and run reconciliation tests.

Health probes use `GET /api/health`. Deploy previews must use isolated data and mock payments.


## Vercel preview branch

The `work` branch is the pre-merge integration branch and should deploy as a Vercel Preview environment before merging to `main`. Keep production payment processing disabled until provider/legal approval is complete.
