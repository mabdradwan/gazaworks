# GazaWorks integration checkpoint — 28 September 2026

This describes the review branch. It is **not** a launch approval or a claim that the production website has these changes.

## Implemented on the review branch

- Restored the existing GazaWorks-branded Gaza hero image and green logo; extended the light public theme, contrast, focus indicators, reduced-motion behavior, and responsive layout refinements. Fixed language-switcher query preservation after hydration.
- Added a bounded server-side RSS headline fetch from UN News and Al Jazeera. The headlines link directly to their original publisher, carry dates and source labels, and fall back to curated editorial items if feeds fail. The separate CMS articles continue to be authored and translated within GazaWorks. This environment cannot reach publisher feeds to confirm live extraction; deployed behavior still requires a browser/network check. The English feed text is currently not translated into the other five languages.
- Added a Brevo transactional-email adapter and a validated public contact endpoint with a fixed recipient, same-origin check, bot honeypot, and local per-instance rate limit. It fails closed unless the server has `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `CONTACT_RECIPIENT_EMAIL`. No production email has been sent or confirmed. Brevo account and sender activation may require verification.
- Added a Gemini OpenAI-compatible provider selected by `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL`; explicit consent is required before AI input/document transfer. Missing credentials produce an unavailable response. A browser login is not an API integration; no production Gemini output has been verified.
- Added a localized client payment panel tied to existing agreements, with an explicitly inactive Bank of Palestine gateway option. It collects no card data and performs no transaction. `PAYMENT_PROVIDER=mock` remains development-only. A real integration requires Bank of Palestine's technical contract, merchant approval, legal/banking decisions, webhook verification, reconciliation, refunds and production tests.

## Known blockers and incomplete product work

- No credentials were obtained from browser account pages and no new secrets were written to Netlify. The existing production environment lacks the Brevo and Gemini keys, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` according to its environment-variable metadata. Production email, AI, and scheduled/administrative server workflows therefore cannot be claimed operational.
- The production Supabase project has migrations 0001–0010 only. An independent workflow/security branch has further migrations for atomic project/payment transitions and email outbox. Those changes need compatibility review and application before the production financial/dispute flow can be treated as reliable. Do not imply tests of the local branch prove production database behavior.
- The workspace still shows raw JSON for several resource panels, English-only operational labels, manual ID entry, and incomplete polished account journeys. Browser testing of all three account types on the latest branch is still outstanding.
- This review branch has not been deployed. A preview deployment requires confirming Netlify credit use with the owner; the production site continues to run the older `main` branch. No live production visual or sign-in verification of these changes has occurred.
- Per-instance rate limiting does not prevent distributed abuse. Before public launch, use durable abuse controls, implement safe email-queue/idempotency policies, verify document and portfolio handling, finish translations and accessibility checks, and test the production configuration against actual credentials and approved workflows.

## Verification performed on the review branch

- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed. The test suite contains 19 tests, including new news-feed and contact-input cases. Lint still reports 10 non-fatal pre-existing warnings.
- A local production server returned HTTP 200 for Arabic, English, Turkish, and German homepages, plus Arabic articles and contact pages; `/api/news` returned HTTP 200 with an empty list because this workspace cannot reach the publishers. The application shows curated fallback entries when that occurs. A GET request to the funding simulation route returned HTTP 405, as expected for a POST-only action; a payment was not simulated.
- There is no current browser route from the cloud browser to the local server, so screenshots, user interaction with every button, actual email delivery, OAuth, and the three account journeys remain unverified. Do not treat the automated checks as visual acceptance.

## Free-tier configuration when ready

1. Finish Brevo account verification, verify a sender address or domain, and securely provision a transactional API key in server-only environment variables. Do not use a Google account password as a Brevo credential.
2. Choose a Google AI Studio project and provision a restricted Gemini API key server-side. Review provider data-use terms before enabling uploads with real CVs.
3. Complete Supabase Auth and scheduled-job credentials, apply reviewed migrations, and validate authorization/RLS against test accounts.
4. Keep payment collection disabled. The client panel is prepared to show agreement amounts and a clearly inactive method until legal/provider approval and a proper server adapter are ready.
5. Review a preview deployment in desktop/mobile and all six locales; verify contact delivery, headline fetch, AI opt-in, and the individual/team/client/admin paths before promoting to production.
