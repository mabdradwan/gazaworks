# Test evidence and acceptance checklist

CI runs four application gates (typecheck, lint, Vitest, production build) plus a real PostgreSQL 17 regression suite. The suite applies the entire migration chain and seeds on an empty database, changes roles to exercise RLS, and rolls back synthetic workflow data.

Coverage includes immutable account types, protected identity/status, offer privacy, finance permissions, funding/acceptance idempotency, 7% accounting, balanced journals, funding-before-delivery, rolling Unicode message moderation and hidden held content, dispute/timer freeze, one final appeal, payout state/reference checks, revision-safe autoaccept, verification readiness/documents/interview/booking, rating eligibility, custom-role atomicity, partial profile saves, forged draft/file ownership, evidence retention, date/currency-safe financial analytics, seed localization and service-only RPC privileges.

Unit tests cover deterministic fee/timer/moderation boundaries, generated profile allowlists and invalid field types, safe partial-profile mapping, missing information, JSON parsing, PDF header agreement and DOCX expansion limits.

Latest recorded baseline: run 35093638952 on `ff142c7` passed 61 SQL assertions and 19 unit tests plus all build gates. Later commits add retention and seed assertions; use their Actions run as the authoritative result.

## Hosted acceptance still required

| Journey | Required observation |
| --- | --- |
| Auth | Register all three types, real email confirmation/reset, Google callback with chosen type, cannot convert type, expired-session refresh, suspended user denied with existing cookies. |
| Profiles | Save each profile type, skills, members/privacy modes, avatar, valid/invalid document uploads, draft confirmation, no identity fields in another client's API response. |
| Verification | Complete profile/documents, request, choose slot, staff interview attendance, approve/reject/change request, no auto-verification, staff notes absent from user responses. |
| Work | Client public/private requests and files, invited vs unrelated talent visibility, two private offers, accept one, immutable agreement. |
| Funding | Explicit simulator only in isolated development, production rejects simulation, no working delivery before captured full funding. |
| Collaboration | Two actual browser sessions receive only permitted Realtime messages, fragmented phone/email held before recipient view, moderator reviews attachments/redaction. |
| Delivery | Upload files, submit final delivery, revision, accept, fast-forward a disposable test clock for timer behavior, one payout only. |
| Dispute | Preserve chat/files, freeze payouts/timer, evidence, human split/full decision, one appeal in 12h, finality and rating gate. |
| Finance | Scoped staff permissions, transfer destination/reference, approval lifecycle, paid retry, per-currency totals, clear simulation markers. |
| AI/CV | Real provider's original/improved extraction, correct facts, manual edits, no save without confirmation, six output languages, readable multipage/RTL PDF print. |
| Admin/CMS | Every editor, role assignment, content publication/scheduling, moderation, notifications, audit visibility, no unimplemented button presented as working. |
| UX | Phone/tablet/desktop, keyboard navigation, screen-reader labels, RTL/LTR switching, all six translations, slow/offline requests and error recovery. |

This checklist is not marked passed. The available Vercel connection is unauthorized for the owning team and the branch preview is protected. The live main site is not the tested branch.
