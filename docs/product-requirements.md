# GazaWorks product requirements

The user's 65-section specification remains the product scope. This document records its acceptance boundaries; it does not replace them with a landing-page MVP.

| Domain | Required behavior |
| --- | --- |
| Identity | Exactly three immutable account types: individual Gaza professional, Gaza team, international client. Email/password, Google, verification/reset, secure sessions, suspension/ban/deletion, security history. |
| Profiles | Rich individual/team profiles, private legal/contact identity, privacy-aware team members, hosted portfolio, configurable limits, six-language editing. |
| Trust | Human in-person Gaza verification, readiness and document gates, appointment availability/staff/attendance/rescheduling, private notes and audited human approval. |
| Discovery | Client-only detailed directory, filters and saved talent, real trust metrics, private direct invitations, later semantic search. |
| Procurement | Structured work requests and attachments, verified recipients, private competing offers, scope negotiation and immutable accepted agreement. |
| Projects | Full funding before work, recorded messages/files/deliveries, revisions, 72-hour review timer, completion and mutual reviews after final dispute resolution. |
| Money | Provider-neutral payment boundary, configurable legally approved custody behavior, 7% default total deduction inclusive of actual provider cost, deterministic balanced ledger, manual payouts, real refund lifecycle. |
| Disputes | Human decisions only, preserved evidence and chat, frozen payout/timers, full/split settlement, exactly one appeal within 12 hours and final second decision. |
| Communication | Private Realtime text/images/files/voice, rolling multi-message external-contact moderation, held content hidden from recipients, human approval/rejection/redaction within a displayed 24-hour target. No native video calls in v1. |
| AI | Editable CV/team extraction, original vs improved wording, stepwise CV builder with PDF export, helpful support, grounded talent search, worker opportunities and manual offer confirmation. AI has no irreversible administrative or money authority. |
| Administration | Granular custom roles; user, verification, appointment, project, offer, finance, dispute, moderation, review, notification, CMS, taxonomy, language, email, AI/security/settings and immutable audit modules. |
| Content | Editable public marketing/policy pages, multilingual articles including scheduled publication, SEO only for public pages, contact details and clear professional CTAs. |
| Privacy/security | RLS, server validation and authorization, private storage/signed URLs, rate limiting, XSS/CSRF/upload controls, secrets isolation, CAPTCHA, login security, retention and future export/deletion support. |
| Languages/design | Arabic RTL plus English, Turkish, Spanish, French and German throughout; responsive phone/tablet/desktop layouts; dignity and professional credibility without invented trust signals. |
| Delivery | Source, migrations, environment example, setup/deployment/admin/provider/storage instructions, fictional seeds and meaningful critical-flow tests. Actual integration and browser evidence are required for operational handover. |

See [BUILD_STATUS.md](BUILD_STATUS.md) for implemented versus unfinished behavior and [development-roadmap.md](development-roadmap.md) for execution order.
