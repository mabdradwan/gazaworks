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

This name correspondence does **not** prove the historical SQL is identical. No migration history was edited during this session. The source migration chain continues to be exercised from scratch in disposable PostgreSQL.

Before releasing to the existing database:

1. Take a coordinated database/application backup and export the applied migration history and schema.
2. Inspect the installed Supabase CLI's version and `--help`, including `migration list`, `migration fetch`, `migration repair`, `db diff` and `db push`. Compare fetched applied SQL with the source and current schema. Preserve the original applied history as evidence.
3. Prepare and rehearse a reviewed deployment baseline on an isolated clone. Ensure every already applied change is recognized exactly once and only missing changes are scheduled. Do not mark an unapplied change as applied to silence a mismatch, reapply core schema, or reset the existing project.
4. Review ordering and dependencies of the currently staged `0011_auth_security.sql`, `20260916060000_atomic_workflows.sql`, and `20260916185305_transactional_email_outbox.sql` against that baseline. Do not blindly rename files or remove historical entries. A fresh-database CI pass alone does not establish an in-place upgrade.
5. Check actual schema differences and pending SQL before the coordinated application/database release described in [DEPLOYMENT.md](DEPLOYMENT.md).

Supabase's [migration CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-repair) describes history repair. Repair changes migration tracking; it is not a substitute for applying or verifying the corresponding schema change.

The read-only data preflight found one profile, no projects or appointments, and zero duplicate project requests, duplicate payout obligations, unbalanced journals, overlapping staff slots or legacy completed interviews. Those observations are a dated snapshot, not a standing guarantee; rerun preflight immediately before rollout.

The email migration filename was created by Supabase CLI 2.117.0 in [tooling run 35137143433](https://github.com/mabdradwan/gazaworks/actions/runs/35137143433), then populated with the tested schema. The tooling workflow is now manual-only and does not connect to a database.
