# Security

Authorization is defense-in-depth: authenticated server handlers validate input and account role, then RLS limits database access. Offer prices are visible only to their author, request client, or authorized administrators. Detailed verified talent is authenticated-only. CSP, frame denial, MIME restrictions, private buckets, signed URL architecture, secure cookies from Supabase SSR, request IDs, validation, and rate limiting reduce common risks.

Service-role and cron secrets are server-only. Audit rows reject updates/deletes. Account type mutation is rejected by a trigger. Suspension is checked before writes. Production must configure CAPTCHA at signup, leaked-password protection and MFA in Supabase, a durable Redis/edge rate limiter, log retention, key rotation, backups, malware scanning, video transcoding, and an incident response destination.
