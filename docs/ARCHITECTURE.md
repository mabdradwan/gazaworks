# Architecture

GazaWorks is a Netlify-deployed Next.js App Router service. GitHub `main` is the code source of truth and Netlify is the production deployment target. React server components render public, workspace, and administration surfaces. Route handlers authenticate via Supabase's cookie session and PostgreSQL/RLS remains the ultimate authorization boundary. Browser code receives only the Supabase anonymous key.

Domains are separated into identity/profile, discovery, verification/appointments, procurement/offers, agreements/projects, messaging/moderation, financial ledger/payouts, disputes/appeals/reviews, CMS, notifications, RBAC/audit, and AI. Immutable agreement snapshots preserve the accepted commercial state. Private files use owner-prefixed paths in non-public Supabase Storage buckets and authorized endpoints issue signed URLs.

Protected scheduled endpoints are authenticated by `CRON_SECRET`; Netlify Scheduled Functions in `netlify/functions/` invoke the auto-accept and dispute-finalization routes on their UTC schedules. Realtime subscriptions can consume RLS-filtered chat and notifications. Stateless instances require a durable edge rate-limit provider in production; the included limiter is a local safety layer.
