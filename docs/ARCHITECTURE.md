# Architecture

GazaWorks is a Vercel-compatible Next.js App Router service. React server components render public, workspace, and administration surfaces. Route handlers authenticate via Supabase's cookie session and PostgreSQL/RLS remains the ultimate authorization boundary. Browser code receives only the Supabase anonymous key.

Domains are separated into identity/profile, discovery, verification/appointments, procurement/offers, agreements/projects, messaging/moderation, financial ledger/payouts, disputes/appeals/reviews, CMS, notifications, RBAC/audit, and AI. Immutable agreement snapshots preserve the accepted commercial state. Private files use owner-prefixed paths in non-public Supabase Storage buckets and authorized endpoints issue signed URLs.

The scheduled auto-accept endpoint is authenticated by `CRON_SECRET`; Vercel Cron or another scheduler calls it. Realtime subscriptions can consume RLS-filtered chat and notifications. Stateless instances require a durable edge rate-limit provider in production; the included limiter is a local safety layer.
