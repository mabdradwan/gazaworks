# Verified implementation status — 2026-09-16

This is a working integration branch, **not a declaration that the full product is production-ready**. Code, applied database migrations, provider configuration, and browser verification are separate deliverables.

## Release state

- Source: `work`, draft PR #4, https://github.com/mabdradwan/gazaworks/pull/4.
- The live site still runs `main`. The connected Supabase project was observed with migrations 0001–0010 applied.
- `0011_auth_security.sql` and `20260916060000_atomic_workflows.sql` are staged in source. This audit has not applied them to the live project.
- The atomic migration revokes legacy direct writes. Deploy it together with the matching application during a coordinated release; applying it alone would break the old application's mutation routes.
- The Vercel connection returned 403 for the owning team. The branch preview requires Vercel authentication. Neither is evidence of a successful live upgrade.

## Implemented and exercised

| Area | Evidence and limits |
| --- | --- |
| Three immutable account types | Auth provisioning trigger, atomic OAuth provisioning, account-type guard; synthetic Auth-row regression coverage. Real Google/email journeys still need a configured browser environment. |
| Profiles and custom RBAC | Atomic typed profile/skills saves, protected verification/status fields, private identity records, custom role assignment and rollback tests. Separate `users.ban` permission is required. |
| Verification | Complete-profile/document gate, one active request, atomic booking, no self-approval, completed interview required, private staff notes; DB tested. Admin rescheduling UX remains limited. |
| Work requests and offers | Correct field mapping, verified-only offers, private prices, direct-hire conversion, invitations, immutable agreement, atomic/idempotent acceptance. |
| Simulated funding and ledger | Explicit development funding only, integer accounting, configurable deduction, actual provider-cost field, balanced deferred journal constraint, repeat funding safe. No real provider is installed. |
| Delivery, disputes and appeal | Captured-funding gate, revision-safe 72h timer, payout freeze, human settlement, one appeal within an exclusive 12h window, immutable first decision, final decision, separate refund obligation. |
| Payouts and ratings | Approval → processing → paid/failed state checks, reference/destination requirements, idempotent paid retry, balanced payout entry. Ratings require the real counterparty and completed dispute/appeal process. |
| Messaging | RLS-filtered Realtime client, atomic moderation queue, Unicode contact normalization and rolling context, held numeric fragments, sender-only pending messages, moderator attachment preview and text redaction. Attachments wait for human review. |
| Private storage | Private buckets, signed URLs, authoritative storage metadata checks for linked files, owner-scoped paths, global portfolio limits, retained verification/evidence records. Malware scanning and transcoding are not implemented. |
| Analytics | Database aggregates, currency-separated totals, paid obligations deducted, financial permission check, date filters, countries/skills/categories, localized dashboard. |
| CV/profile drafts | PDF/DOCX header validation, DOCX expansion cap, original source preserved, schema-checked editable fields, original/improved wording options, explicit profile confirmation. Private CV saves, two printable layouts, six languages. Actual AI generation needs a provider and has not been end-to-end tested in this session. |
| AI control | Provider boundary, time/output bounds, persistent per-account minute/day quota, recorded generation IDs and hashed inputs, explicit unavailable response when no real provider exists. No financial or administrative execution tools. |
| Public copy | Six-language homepage/navigation, removed invented statistics and unsupported secured-payment promises. |
| Development setup | Isolated PostgreSQL policy/workflow suite, pinned dependency lock, CI, administrator bootstrap, guarded fictional-user seed script. |

## Remaining implementation and acceptance work

1. **Browser acceptance**: real signup/email confirmation/reset/Google callbacks, session refresh, multi-account Realtime, uploads, RTL/mobile/screen reader checks, CV print output, all administrative editors. Production and protected preview have not been used as evidence for this branch.
2. **Localization**: public shell, import/CV, selected workflow editors and analytics have six-language copy. Numerous existing dashboard, auth, policy, and CMS controls still have only Arabic/English or English. Full six-language UI is unfinished.
3. **Payments**: real provider adapter, signed webhooks, reconciliation, provider-cost ingestion, actual refund execution/confirmation, payout proof upload and configurable custody/legal approval. A refund liability in the ledger does not mean money was returned.
4. **Media**: automatic image optimization, video compression/transcoding, thumbnail generation, malware quarantine/scanning, retention/deletion workflows and configurable upload limits across every route.
5. **Administration**: appointment reschedule/staff workflows, full profile editor, account report handling, account export/deletion lifecycle, richer search/pagination, and replacement of remaining generic record viewers.
6. **Notifications**: important transactional email delivery/outbox/retries, staff assignment workflows, complete account/security event coverage, operational monitoring/alerts. Auth email uses Supabase configuration; email templates alone do not send messages.
7. **Discovery and AI**: scalable database search/pagination, validated recommendation cards, semantic retrieval, worker opportunity matching, structured offer drafting. Current directory/search candidates are capped; AI output quality and privacy evaluation remain necessary.
8. **Settings**: several stored feature flags, language settings and upload settings are not yet connected to every runtime consumer. Do not assume a saved JSON setting activates an uninstalled capability.
9. **Operations**: coordinated staging migration and deployment, backup restore rehearsal, live RLS/advisor checks, CAPTCHA, leaked-password protection, production security review, scheduler cadence and alerts.

## Current automated evidence

GitHub Actions run 35093638952 passed **61 PostgreSQL assertions, 19 domain tests, TypeScript, ESLint and the Next.js production build** on commit `ff142c7`. Subsequent commits extend file-retention coverage; their own CI run is authoritative. Warnings from existing React hook dependencies remain separate from build errors.

The database harness uses real PostgreSQL 17 with minimal Supabase Auth/Storage schema fixtures. It tests SQL permissions and transaction behavior, not the hosted Supabase Auth/Storage HTTP services, simultaneous browsers, delivery of real emails, or a real bank.
