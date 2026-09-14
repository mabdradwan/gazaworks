# GazaWorks build status

Status meanings:

- **COMPLETE**: implemented end-to-end in the repository and backed by real application logic.
- **PARTIAL**: implemented but still needs product polish, broader QA, or a provider integration.
- **MOCKED**: intentionally development-only.
- **REQUIRES EXTERNAL CREDENTIALS**: code is ready for configuration, but a third-party account/secret/approval is still required.
- **REQUIRES EXTERNAL APPROVAL**: functionality must not be enabled until banking/legal/provider approval exists.

## Current implementation

| Capability | Status | Boundary |
|---|---|---|
| Public marketing site | COMPLETE | Responsive multilingual routes and professional GazaWorks positioning are implemented. |
| Public CMS policy/about pages | COMPLETE | Published page content is loaded from Supabase and editable through the admin CMS. Legal copy still requires legal review before launch. |
| Blog/articles | COMPLETE | Public article listing plus multilingual admin authoring/publishing API and UI. |
| Six locale routing | COMPLETE | Arabic, English, Turkish, Spanish, French and German common public copy are implemented. |
| Arabic RTL | COMPLETE | Locale-based document direction and logical-direction styling are implemented. |
| Full translation of every dashboard/admin sentence | PARTIAL | Core public copy is translated; many operational workspace/admin labels remain English and need final localization QA. |
| Email/password authentication | REQUIRES EXTERNAL CREDENTIALS | Supabase Auth registration, login, confirmation callback and password reset are implemented; production email configuration remains. |
| Google OAuth | REQUIRES EXTERNAL CREDENTIALS | OAuth initiation/callback exists; Google credentials and production redirect URLs must be configured in Supabase. |
| Immutable account type | COMPLETE | Individual/team/client is selected at registration and protected by a database trigger. |
| Individual profile | COMPLETE | Authenticated load/edit/save, professional details and private fields. |
| Team profile and member privacy | COMPLETE | Team profile plus member add/list/remove and name/photo/alias/anonymous modes. |
| Client profile | COMPLETE | Minimal low-friction client profile with country/company/organization data. |
| CV/PDF/DOCX import | COMPLETE | Authenticated PDF/DOCX upload, text parsing, private source storage, AI-assisted draft generation, user confirmation boundary. |
| AI CV builder | COMPLETE | Editable CV interview form, AI wording assistance and browser print/save-to-PDF workflow. |
| Portfolio records | COMPLETE | Create/edit/delete portfolio projects with configured image/video limits. |
| Portfolio storage | COMPLETE | Signed private upload workflow, MIME/size limits and verified-directory read policy. Image/video optimization/transcoding remains a deployment enhancement. |
| Verification request | COMPLETE | Profile completion gate, request status and duplicate prevention. |
| Verification appointments | COMPLETE | User booking plus administrator slot creation/status management. |
| In-person verification decision | COMPLETE | Admin review/status decisions, synchronized verified status and notifications. Human interview remains an operational process. |
| Verified talent directory | COMPLETE | Authenticated database-backed individual/team directory with verified-only RLS. |
| Talent filters | COMPLETE | Name/profession, type, skill, experience and rate filters. |
| Saved talent | COMPLETE | Client favorites API and workspace page. |
| AI talent search | REQUIRES EXTERNAL CREDENTIALS | Database-grounded candidate set and strict no-invention prompt are implemented; real AI requires provider credentials. |
| Work requests | COMPLETE | Client publishing, taxonomy, skills, budgets, visibility and published request listing. |
| Private invitations/direct outreach | COMPLETE | Client can send an existing work request privately to chosen eligible talent. |
| Private offers | COMPLETE | Talent offer submission and RLS confidentiality; client can accept its own offers. |
| Project agreement | COMPLETE | Accepted offer creates immutable agreement snapshot, project and private chat room. |
| Funding gate | COMPLETE / MOCKED | Project cannot officially proceed until funded; development funding provider is explicit mock only. |
| 7% accounting model | COMPLETE | Integer accounting records gross, total deduction, provider fee, platform net and worker entitlement deterministically. |
| Real payment gateway | REQUIRES EXTERNAL APPROVAL | Provider abstraction exists; real custody/payment must not be enabled before bank/provider/legal approval. |
| Transaction ledger | COMPLETE | Transactions, payments, ledger entries and participant/admin read flows. |
| Delivery/revision/acceptance | COMPLETE | Talent delivery, client acceptance/revision and status transitions. |
| 72-hour automatic acceptance | COMPLETE | Protected scheduled job accepts eligible undisputed deliveries and creates payout obligations. |
| Payout administration | COMPLETE | Manual payout statuses, destination/reference/notes and final paid transition. Real payout rail remains external. |
| Dispute opening/evidence | COMPLETE | Party authorization, payout freeze state, evidence records and admin review. |
| First dispute decision | COMPLETE | Manual GazaWorks decision with full/refund/split settlement validation. |
| Single 12-hour appeal | COMPLETE | Unique appeal, RLS time window, admin final decision and scheduled no-appeal finalization. |
| Mutual reviews | COMPLETE | Completion-gated mutual ratings and feedback records. |
| Text chat | COMPLETE | Participant-only project rooms and held-message moderation. |
| Realtime chat | COMPLETE | Supabase Realtime publication and room subscription. |
| Chat images/PDF/voice attachments | COMPLETE | Signed private uploads for supported attachment/voice MIME types. Native in-browser voice recording remains a polish enhancement. |
| Off-platform contact detection | COMPLETE | Rolling multi-message deterministic detection and pending moderation state. |
| Message moderation | COMPLETE | Admin queue with approve/reject/redact controls and audit coverage. |
| In-app notifications | COMPLETE | Categorized notification records, user list/read flow and realtime-ready table. |
| Transactional email delivery | REQUIRES EXTERNAL CREDENTIALS | Email architecture/policy exists but a transactional email provider is not connected. |
| Admin user management | COMPLETE | Live users, activation/suspension/ban and featured talent controls with audit log. |
| Custom RBAC | COMPLETE | Roles, permissions, assignments, role creation API and administration surface. |
| Admin verification | COMPLETE | Live review and decision controls. |
| Admin appointments | COMPLETE | Slot creation and operational status controls. |
| Admin disputes/appeals | COMPLETE | Evidence visibility, first decision and final appeal decision endpoints/UI. |
| Admin payouts | COMPLETE | Payout review and lifecycle controls. |
| Admin CMS/articles | COMPLETE | Static multilingual pages and blog article authoring. |
| Analytics | COMPLETE | Live aggregate endpoint for users, verified talent, clients, projects, financial totals and disputes. |
| Audit logs | COMPLETE | Append-only table plus operational audit triggers on sensitive tables. |
| Security logs | PARTIAL | Schema and protected access exist; more automated login-risk event ingestion can be added after production observability provider selection. |
| Storage security | COMPLETE | Private buckets and owner/participant/admin policies for portfolio, documents, projects, chat, verification and dispute evidence. |
| Scheduled jobs | COMPLETE | Vercel cron configuration for auto-accept and dispute finalization with CRON_SECRET authorization. |
| Admin bootstrap | COMPLETE | Server-side script assigns the first registered account the seeded Super Admin role. |
| AI support assistant | REQUIRES EXTERNAL CREDENTIALS | UI/provider boundary exists; real answers require AI provider credentials. |
| AI dispute/payment decisions | PROHIBITED | Deliberately not implemented. AI does not approve verification, decide disputes, release money or authoritatively calculate finance. |
| Tests/CI | COMPLETE | GitHub Actions successfully installs dependencies and passes TypeScript typecheck, ESLint, Vitest, and the Next.js production build on the work branch. |
| Production deployment | REQUIRES EXTERNAL CREDENTIALS | Needs Vercel connection/environment variables, Supabase production Auth URLs, AI/email credentials as desired, and domain configuration. |

## Database state

The connected Supabase project has migrations **0001 through 0007** applied:

1. core marketplace schema
2. security/CMS/RBAC
3. onboarding and user policies
4. RLS/security hardening and indexes
5. operational taxonomy/CMS defaults
6. Realtime publication and sensitive audit triggers
7. complete private storage buckets/policies

Supabase security advisor currently reports one intentional warning: signed-in users can execute the narrowly scoped SECURITY DEFINER function `has_permission(required text)`. This function only returns whether the current authenticated user has an assigned permission and is required by RLS and server permission checks. Reassess it before financial launch if the authorization architecture changes.

Supabase performance advisor reports optimization opportunities around RLS init plans and multiple permissive policies. These are performance warnings rather than access-control failures and should be tuned after realistic load testing.

## Production secrets/configuration

Never commit these secrets.

Required for deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / compatible public publishable key
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

Optional/feature credentials:

- `OPENAI_API_KEY` and provider/model configuration for real AI
- Google OAuth credentials configured in Supabase
- transactional email provider credentials
- CAPTCHA/anti-abuse provider if selected
- approved payment provider credentials only after legal/banking approval

## Financial launch restriction

`PAYMENT_PROVIDER=mock` is explicitly development-only. Do not present simulated transactions as real payment custody. Before processing third-party funds, GazaWorks must complete bank/payment-provider approval, applicable KYC/AML/custody review, refund/reconciliation testing, and legal/accounting review.

## First administrator

1. Deploy/configure Supabase Auth.
2. Register the intended administrator normally so an Auth user/profile exists.
3. In a secure server/local shell with the service-role secret, run:

```bash
node scripts/bootstrap-admin.mjs admin@example.com
```

Never expose the service-role secret in a browser or public log.
