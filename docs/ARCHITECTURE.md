# System architecture

GazaWorks is a Next.js App Router application with strict TypeScript, React server/client components, Supabase Auth, PostgreSQL, private Storage and Realtime. Existing design and routes remain in place while workflows are hardened incrementally.

Domain boundaries are identity/profiles, verification/appointments, directory/procurement, project agreements/delivery, messaging/moderation, finance/payouts, disputes/appeals/reviews, CMS, notifications, administration and AI. `src/domain` holds deterministic validation/business helpers; `src/lib` contains server-only adapters and authorization; route handlers validate input and call scoped domain operations.

Sensitive transitions use service-only PostgreSQL functions with actor, permission, state, idempotency and lock checks. Each accepted offer creates its project, immutable agreement, chat and notifications in one transaction. Funding creates payment and balanced journal together. Dispute freezes, settlement and payouts operate on the same locked project state. Ordinary reads and non-privileged edits retain RLS. The privileged server key does not make a route authorized by itself.

Private identities remain outside the client's table-read permissions. Authorized directory handlers explicitly select public professional fields. Signed file URLs are issued only after a permitted record read; stored references receive ownership/metadata checks. Pending moderation content has separate visibility from delivered content.

AI is an external replaceable provider used only for draft text/structured fields. Quotas and generation history persist in PostgreSQL. The user explicitly applies generated profile/CV drafts. A configured provider is required; development placeholders are not published as generated results.

Timers expose secret-authenticated endpoints and use idempotent database state transitions. Both endpoints can safely run concurrently. Their scheduler cadence is a separate operational setting. The checked-in daily schedule is not sufficient to promise immediate deadline processing.

Payment custody is not enabled. The deterministic accounting model records simulated development funding and human-recorded payout status. A real payment adapter, signed webhook ingestion, refunds/reconciliation and approvals remain release prerequisites. See `PAYMENTS.md` and `BUILD_STATUS.md` for exact boundaries.
