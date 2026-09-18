# Database

`0001_core.sql` defines normalized marketplace entities, enum state machines, financial checks, delivery deadlines, private offers, moderation, disputes, one-appeal uniqueness, and mutual reviews. `0002_security_cms.sql` adds granular RBAC, append-only audit controls, CMS translations, AI records, settings, RLS, and private storage.

Amounts use integer minor units and ISO currency codes. A transaction check enforces `gross = platform deduction + worker entitlement` and `deduction = provider fee + platform revenue`. Payment events and payouts are separate from the transaction aggregate; double-entry ledger rows are retained independently. Apply migrations in filename order, then `supabase/seed.sql`.


The staged atomic-workflow migration adds a private helper schema, restrictive active-account policies, explicit service-only RPC grants, uniqueness constraints for awards/payouts/bookings, settlement snapshot fields, durable rate counters, balanced ledger constraints, typed profile transactions, and file-reference/retention guards. All public user-facing tables enable RLS. `supabase/tests/workflows.sql` switches database roles to validate direct-API restrictions as well as happy paths.

Production migration must be coordinated with the matching application revision. New uniqueness rules may intentionally fail on inconsistent legacy data; audit/reconcile the data before rollout. Never repair history by silently deleting duplicate money records. Tests bootstrap an empty disposable PostgreSQL database and must not run against production.

Appointments store an optimistic `version`, explicit attendance and its recorded timestamp. Service-only functions create, assign, reschedule, block, cancel, mark attendance and complete interviews. A scheduling lock and overlap guard serialize staff calendars; cancellation preserves history. Verification approval requires an attended completed interview. Applicant notifications contain status/times and no staff notes.
