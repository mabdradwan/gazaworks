# Existing database migration baseline

A read-only inspection on 2026-09-16 found that the connected project's applied migration versions differ from the short numeric prefixes in this repository. **Do not run an unreviewed `db push` against that existing project.** The mismatch is about migration history, not permission to recreate the existing schema.

| Source migration | Observed applied version |
| --- | --- |
| `0001_core.sql` | `20260914230119` |
| `0002_security_cms.sql` | `20260914230125` |
| `0003_onboarding_policies.sql` | `20260914230129` |
| `0004_security_hardening.sql` | `20260914230318` |
| `0005_operational_defaults.sql` | `20260914230422` |
| `0006_realtime_audit.sql` | `20260914231336` |
| `0007_storage_completion.sql` | `20260914231850` |
| `0008_profile_depth.sql` | `20260915073936` |
| `0009_product_completion.sql` | `20260915082614` |
| `0010_advisor_followup.sql` | `20260915144146` |

On 2026-09-30, the exact SQL stored in production migration history was exported and compared with the source. The executable statements in `0001`–`0010` match; differences are comments, whitespace and final newlines. No historical migration record was edited. The source migration chain and an in-transaction upgrade from the `0010` baseline are exercised in disposable PostgreSQL by CI.

The following six changes were applied in order through the Supabase migration connector after a private logical recovery archive was saved. Production retained its existing Auth user and profile, and the schema probes and permission check passed.

| Source migration | Applied production version | Applied name |
| --- | --- | --- |
| `0011_auth_security.sql` | `20260930073108` | `auth_security` |
| `20260916060000_atomic_workflows.sql` | `20260930073145` | `atomic_workflows` |
| `20260916185305_transactional_email_outbox.sql` | `20260930073209` | `transactional_email_outbox` |
| `20260929100000_direct_hire_notice.sql` | `20260930073215` | `direct_hire_notice` |
| `20260929110000_real_funds_for_payout.sql` | `20260930073219` | `real_funds_for_payout` |
| `20260930090000_atomic_cms.sql` | `20260930155344` | `atomic_cms_publication` |
| `20260930170000_taxonomy_contact.sql` | `20260930173516` | `atomic_taxonomy_contact_quota` |

The private `GazaWorks-recovery-2026-09-30.zip` archive in the project owner's files contains all ten originally applied SQL statements, a live schema catalog, and 99 table snapshots (436 rows). It includes sensitive Auth data and must never be committed or published. The archive integrity and generated recovery SQL were checked; a full database restore on a separate Supabase project is still outstanding. There were no stored objects to export at the time.

Before a future schema release or automated `db push`:

1. Create a fresh backup, preferably a real `pg_dump` in addition to the logical archive, and verify a restore on an isolated project.
2. Inspect the installed Supabase CLI's version and `--help`, including `migration list`, `migration fetch`, `migration repair`, `db diff` and `db push`. Preserve the original applied history as evidence.
3. Reconcile the production versions above with repository filenames in an isolated clone before using `db push`. Ensure every already applied change is recognized exactly once. Do not mark an unapplied change as applied to silence a mismatch, reapply core schema, or reset the existing project.
4. Check actual schema differences and pending SQL before another coordinated application/database release described in [DEPLOYMENT.md](DEPLOYMENT.md).

Supabase's [migration CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-repair) describes history repair. Repair changes migration tracking; it is not a substitute for applying or verifying the corresponding schema change.

The read-only data preflight found one profile, no projects or appointments, and zero duplicate project requests, duplicate payout obligations, unbalanced journals, overlapping staff slots or legacy completed interviews. Those observations are a dated snapshot, not a standing guarantee; rerun preflight immediately before rollout.

The email migration filename was created by Supabase CLI 2.117.0 in [tooling run 35137143433](https://github.com/mabdradwan/gazaworks/actions/runs/35137143433), then populated with the tested schema. The tooling workflow is now manual-only and does not connect to a database.
