# Verified implementation status — 2026-09-17

This is a working integration branch, **not a declaration that the full product is production-ready**. Code, applied database migrations, provider configuration, and browser verification are separate deliverables.

## Release state

- Source: `work`, draft PR #4, https://github.com/mabdradwan/gazaworks/pull/4.
- The live site still runs `main`. The connected Supabase project was observed with migrations 0001–0010 applied.
- `0011_auth_security.sql`, `20260916060000_atomic_workflows.sql` and `20260916185305_transactional_email_outbox.sql` are staged in source. This audit has not applied them to the live project.
- Applied production versions use timestamp IDs that differ from the source prefixes. Review [MIGRATION_BASELINE.md](MIGRATION_BASELINE.md) before any CLI push.
- The atomic migration revokes legacy direct writes. Deploy it together with the matching application during a coordinated release; applying it alone would break the old application's mutation routes.
- Authorized browser access to Vercel and the protected branch preview was restored on September 17. The Vercel connector still returns 403 independently of that browser session. The public site remains on `main` at `8cc5747`.
- Vercel currently uses the same Supabase environment-variable entries for Production and Preview. The connected account has one project and no development branches; its schema still stops at 0010. Hosted authenticated workflow acceptance needs an isolated staging database with the pending migrations. See [BROWSER_ACCEPTANCE.md](BROWSER_ACCEPTANCE.md).

## Implemented and exercised

| Area | Evidence and limits |
| --- | --- |
| Three immutable account types | Auth provisioning trigger, atomic OAuth provisioning, account-type guard; synthetic Auth-row regression coverage. Real Google/email journeys still need a configured browser environment. |
| Profiles and custom RBAC | Atomic typed profile/skills saves, protected verification/status fields, private identity records, custom role assignment and rollback tests. Separate `users.ban` permission is required. |
| Verification | Complete-profile/document gate, one active request, atomic booking, no self-approval, completed interview required, private staff notes; DB tested. Staff calendars now include assignment, overlap prevention, versioned rescheduling, block/cancel, attendance, separate interview completion, user history and notifications. |
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
| Hosted entry-flow fixes | Registration and password-recovery modes survive locale switching; login preserves a validated internal return destination. Visitors receive a localized private-directory sign-in gate. Inactive accounts cannot enter the workspace shell. Storage CSP permits signed images/audio/video only from the configured project, while production no longer permits script eval. Uploaded-media playback and real credential flows remain unverified. |
| Important email | Private transactional outbox, confirmed Auth destination, immutable retry envelope, provider adapter, bounded idempotent retries, signed callbacks, bounce/complaint suppression, staff queue/template controls and six-language copy. Separate-connection claim and callback races pass. No real provider delivery has been tested; default is disabled. |
| Administrative navigation | Authenticated active-staff entry, six-language navigation, content beside desktop sidebar, accessible mobile menu. Hosted visual/keyboard acceptance remains pending. |
| Development setup | Isolated PostgreSQL policy/workflow suite, pinned dependency lock, CI, administrator bootstrap, guarded fictional-user seed script. |

## Remaining implementation and acceptance work

1. **Browser acceptance**: protected-preview public entry flows and desktop Arabic RTL were inspected after the fixes. Real signup/email confirmation/reset/Google callbacks, session refresh, multi-account Realtime, uploads, mobile/screen reader checks, CV print output and administrative editors remain pending. No real account was created or password changed in this acceptance pass.
2. **Localization**: public shell, import/CV, verification/appointment flows, selected workflow editors, email administration, administrative navigation and analytics have six-language copy. Numerous existing dashboard, auth, policy, and CMS controls still have only Arabic/English or English. Full six-language UI is unfinished.
3. **Payments**: real provider adapter, signed webhooks, reconciliation, provider-cost ingestion, actual refund execution/confirmation, payout proof upload and configurable custody/legal approval. A refund liability in the ledger does not mean money was returned.
4. **Media**: automatic image optimization, video compression/transcoding, thumbnail generation, malware quarantine/scanning, retention/deletion workflows and configurable upload limits across every route.
5. **Administration**: full profile editor, account report handling, account export/deletion lifecycle, richer search/pagination, and replacement of remaining generic record viewers.
6. **Notifications**: real provider/sender domain/webhook/scheduler acceptance for the implemented outbox, staff assignment workflows, complete account/security event coverage, operational monitoring/alerts. Auth verification/reset email still uses separate Supabase configuration.
7. **Discovery and AI**: scalable database search/pagination, validated recommendation cards, semantic retrieval, worker opportunity matching, structured offer drafting. Current directory/search candidates are capped; AI output quality and privacy evaluation remain necessary.
8. **Settings**: several stored feature flags, language settings and upload settings are not yet connected to every runtime consumer. Do not assume a saved JSON setting activates an uninstalled capability.
9. **Operations**: coordinated staging migration and deployment, backup restore rehearsal, live RLS/advisor checks, CAPTCHA, leaked-password protection, production security review, scheduler cadence and alerts.

## Current automated evidence

GitHub Actions run [35216999550](https://github.com/mabdradwan/gazaworks/actions/runs/35216999550) passed **150 PostgreSQL checks (146 SQL assertions and four concurrency scenarios), 74 unit/integration tests, TypeScript, ESLint and the Next.js production build** on commit `2bcdb8c`. The concurrency scenarios use separate PostgreSQL connections for calendar overlap, distinct worker claims and both callback/send commit orders. Added tests cover safe navigation, locale-state preservation, media CSP and unauthenticated/unauthorized directory access. Existing React hook warnings remain; they are not build failures.

The database harness uses real PostgreSQL 17 with minimal Supabase Auth/Storage schema fixtures. It tests SQL permissions and transaction behavior, not the hosted Supabase Auth/Storage HTTP services, simultaneous browsers, delivery of real emails, or a real bank.
