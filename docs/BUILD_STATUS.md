# GazaWorks build status

Status meanings: **COMPLETE** is usable end-to-end in this repository; **PARTIAL** has real schema/API/UI but needs additional breadth; **MOCKED** is explicitly development-only; **NOT IMPLEMENTED** has no usable flow; **REQUIRES EXTERNAL CREDENTIALS** is implemented but cannot connect without the named service.

| Capability | Status | Precise boundary |
|---|---|---|
| Public website and policies | COMPLETE | Responsive routes exist for every requested public destination. Policy copy requires legal approval. |
| Six-language routing / Arabic RTL | PARTIAL | All six locale routes and direction switching work; English and Arabic core copy exist; Turkish, Spanish, French, German and long-form pages use English fallback. |
| Email/password Auth | REQUIRES EXTERNAL CREDENTIALS | Real Supabase signup/sign-in, confirmation callback and reset request UI; requires Supabase URL/key and email configuration. |
| Google Auth | REQUIRES EXTERNAL CREDENTIALS | Real OAuth initiation/callback; requires Google credentials in Supabase. |
| Immutable account types | COMPLETE | Exactly individual/team/client; database trigger rejects conversion. |
| Account suspension/ban/deletion/login history/2FA | PARTIAL | States and security log exist; full admin/session UI and 2FA enrollment are not implemented. |
| Individual profile | COMPLETE | Account provisioning, authenticated load/edit/save, private contact columns, validation and owner RLS. |
| Team profile and members | COMPLETE | Team editor via shared profile flow plus add/list/remove members and all four privacy modes. Image workflow remains under Portfolio/Storage. |
| Client onboarding | COMPLETE | Minimal signup and editable country/company/organization profile. |
| CV/team document extraction | PARTIAL | Private document bucket, editable draft records and AI task/provider exist; browser upload and DOCX/PDF text extraction are not implemented. |
| AI profile assistance | PARTIAL | Authenticated draft endpoint and provider safety boundary exist; field-level profile interview UI is not implemented. |
| AI CV builder / downloadable PDF | NOT IMPLEMENTED | Task abstraction exists, but interview and PDF renderer are absent. |
| Portfolio management | PARTIAL | Normalized records, limits, private MIME-restricted storage and owner RLS exist; upload/progress/optimization/thumbnail UI is not implemented. |
| Verification request | COMPLETE | Profile-gated authenticated request and status UI with duplicate protection. |
| Admin verification review | PARTIAL | States, private notes, permission and update RLS exist; dedicated decision editor is not implemented. |
| Appointment booking/admin slots | PARTIAL | Atomic user slot booking/list flow and admin permissions exist; admin slot calendar editor is not implemented. |
| Verified badge | PARTIAL | Database status and authenticated directory badges exist; directory currently uses illustrative cards instead of database search. |
| Talent filters/favorites | PARTIAL | Schema and RLS exist; database-driven filtered UI and favorite controls are not implemented. |
| AI talent search | PARTIAL | Grounded task boundary exists; verified-profile retrieval/ranking pipeline is not implemented. |
| Work requests/invitations | PARTIAL | Client-only validated publish flow, visibility and invitation schema exist; taxonomy selector/list/edit/invite UI remains. |
| Private offers/comparison/direct hiring | PARTIAL | Confidential RLS schema exists; submission/comparison/direct-hire UI is not implemented. |
| Agreements/project lifecycle/delivery | PARTIAL | Snapshot schema, status model and funded delivery RLS exist; acceptance/funding/delivery screens are not implemented. |
| 72-hour automatic acceptance | COMPLETE | Secret-protected idempotent scheduled handler skips open disputes and moves eligible projects to payout pending. |
| Payment and ledger | MOCKED | Deterministic integer accounting and normalized records are complete; provider intentionally simulates and no real custody occurs. |
| Payout administration | PARTIAL | Full record/proof/status model and permissions exist; admin editor is not implemented. |
| Disputes/evidence/appeal | PARTIAL | Party RLS, payout-freeze-compatible states, evidence, manual decision and unique time-bound appeal schema exist; full screens are absent. |
| Mutual reviews | PARTIAL | Completion-gated mutual review model/RLS exists; rating forms and moderation UI are absent. |
| Realtime chat/files/voice | PARTIAL | Participant-only messages, private attachment bucket and held-message API exist; realtime composer/upload/player UI is absent. |
| Contact moderation/admin decisions | PARTIAL | Rolling-context deterministic detection and non-delivery state are complete; administrator decision/redaction UI is absent. |
| Notifications/email | PARTIAL | Notification model/RLS exists. Delivery worker, preferences, templates and email provider are not implemented. |
| Admin dashboard/RBAC/users | PARTIAL | Complete module navigation, permission model and sensitive RLS exist; most module screens are read-only shells. |
| CMS/blog | PARTIAL | Multilingual normalized schema and public-read RLS exist; authoring/publishing UI is not implemented. |
| Analytics/audit/security logs | PARTIAL | Models and immutable audit controls exist; aggregation dashboards and automatic audit triggers remain. |
| Storage security | PARTIAL | Private buckets, file limits/MIME allowlists and owner policies exist; malware scanning and participant project-file policies require implementation/audit. |
| Seed data | PARTIAL | Fictional taxonomy and all system roles/permissions are seeded. Auth-linked personas require generated local Auth UUIDs. |
| Empty/loading/error states | PARTIAL | New authenticated forms include explicit states; broader route-level boundaries are not implemented. |
| Responsive/mobile behavior | PARTIAL | Responsive public/app layout and logical-direction CSS exist; full device/browser QA awaits a runnable dependency install. |
| CI and deployment | PARTIAL | GitHub Actions conditionally uses `npm ci` when a lockfile exists and `npm install` otherwise, then runs typecheck, lint, tests, and build. A lockfile cannot be generated in this environment because every registry endpoint returns HTTP 403. |

## Credentials and external approvals

Supabase URL/anonymous key are required for user flows; the service-role key is server-only and required solely for trusted scheduled jobs. AI is optional and defaults to an honest unavailable mock. Google OAuth, transactional email, CAPTCHA, durable rate limiting, monitoring and malware scanning require provider credentials. Real payment custody, KYC/AML, refunds, taxation and payout rails require legal/banking approval and a reviewed provider adapter.

## Current environment limitation and verification

The execution proxy rejects CONNECT requests to npmjs and alternative registries with HTTP 403. Consequently `npm install`, lockfile generation, dependency-backed TypeScript/ESLint/Vitest/Next build, application startup, and screenshot capture cannot run here. `.github/workflows/ci.yml` bootstraps with `npm install` when no lockfile exists and executes all four quality gates on GitHub. Once installation succeeds, the generated `package-lock.json` should be committed so subsequent CI runs use reproducible `npm ci`. The application must not be described as production-ready until CI passes.

## Deployment requirements

Node 22, Vercel-compatible hosting, migrated Supabase, secure environment variables, Auth redirect URLs, a scheduler calling the auto-accept endpoint, durable distributed rate limiting, observability, backups and private-file retention controls are required. Mock transactions must never be enabled for a financial production environment.
