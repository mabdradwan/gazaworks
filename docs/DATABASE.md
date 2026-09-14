# Database

`0001_core.sql` defines normalized marketplace entities, enum state machines, financial checks, delivery deadlines, private offers, moderation, disputes, one-appeal uniqueness, and mutual reviews. `0002_security_cms.sql` adds granular RBAC, append-only audit controls, CMS translations, AI records, settings, RLS, and private storage.

Amounts use integer minor units and ISO currency codes. A transaction check enforces `gross = platform deduction + worker entitlement` and `deduction = provider fee + platform revenue`. Payment events and payouts are separate from the transaction aggregate; double-entry ledger rows are retained independently. Apply migrations in filename order, then `supabase/seed.sql`.
