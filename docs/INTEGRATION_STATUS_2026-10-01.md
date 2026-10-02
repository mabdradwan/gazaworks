# GazaWorks integration checkpoint — 1 October 2026

This is an integration checkpoint, not final acceptance. The official Netlify production application remains on `main` (`ecea9d8`); PR #7 is the integrated application under review.

## Confirmed runtime configuration

- The owner signed in to the Supabase and Netlify dashboards. The intended Supabase project is `cvkpardnzwkfgmlmjccm`; the official Netlify site is `gazaworks`, ID `b344c2fd-8189-47b5-b18e-0dc8239b800e`.
- After explicit owner confirmation, the existing Supabase `service_role` key was saved as `SUPABASE_SERVICE_ROLE_KEY`, marked secret, in production and deploy-preview contexts only. Netlify's authoritative environment-variable list confirmed both values, secret protection and builds/functions/runtime scopes. Other contexts have no value. No credential was committed, logged or included in this document. Copy/reveal controls for the newer secret key did not yield its full value, so the compatible existing legacy key was used.
- Supabase has 17 migration records. The read-only readiness function returns true; `service_role` can execute it and `authenticated` cannot. Existing user data was preserved.
- Supabase Site URL changed from the old Vercel address to `https://gazaworks.netlify.app`. Allowed callbacks were added for `https://gazaworks.netlify.app/auth/callback**` and the specific PR #7 preview host. Existing Vercel entries were preserved.
- Netlify rebuilt PR #7 at `fe0a507` as deploy `6abe13a04f5e0feb1fb9b3ac`. It completed successfully. The preview's Arabic registration form no longer displays the readiness pause and its email registration controls are enabled. This confirms the deployed server can call the protected database marker; it does not prove delivery of a signup email or every account journey.
- Supabase Email is enabled and Confirm email remains enabled. Google is disabled. No authentication protection was disabled and no paid upgrade was purchased.

## Authentication repairs in this revision

- Password recovery now sends a PKCE callback preserving the user's supported language and the update-form destination. Previously it returned to `/en/auth` and had no password-update form.
- Recovery has translated request/update forms for all six locales. Update fields remain disabled without a server-verified session. The auth service is checked again before updating the password; mismatch/length validation runs before any update call. Successful updates request global sign-out. A logout failure explicitly distinguishes a changed password from a failed update.
- The Google button is enabled only when the Auth service's public provider settings confirm Google is enabled. Missing, malformed or unavailable settings fail closed. The UI explains that email sign-in is available while Google setup is pending.
- TypeScript, ESLint, 202 unit tests and the production build passed locally, including 24 new recovery/provider cases. Remote CI and preview acceptance must be recorded after this revision is committed and deployed.

## Remaining release gates

1. Independently exercise real signup confirmation, email recovery and account-specific journeys; complete custom Auth SMTP/Brevo configuration and verified sender delivery. The generic login error should never substitute for verified delivery.
2. Configure Google OAuth, the existing Gemini Free-tier key, Brevo API delivery, and the scheduled-job secret without paid plans or exposing credentials. Gemini API access does not configure Google OAuth.
3. Verify individual/team/client/staff workflows, storage/RLS, appointments, chat moderation, CMS, disputes/appeals and mobile/RTL views against the release candidate. Exercise the new recovery failure states in its deployed preview.
4. Rehearse isolated backup restoration, finish operational/media/abuse controls and record unresolved external dependencies honestly.
5. Merge and publish the official production application only after the release gates pass. Bank of Palestine payments remain disabled until the owner's later bank integration.

## Integration follow-up (1 October, 12:52 UTC)

- Following the owner's specific confirmation, the existing Gemini Free-tier key and new Brevo transactional API key were saved as secret values in the official site's production and trusted deploy-preview contexts. A cryptographically random scheduled-job secret was saved in the same contexts. No key is available in local-development or general branch contexts; untrusted forks still require approval. Authoritative Netlify metadata confirms persistence.
- `AI_PROVIDER=gemini`, `EMAIL_PROVIDER=brevo`, verified sender and owner contact recipient are configured. `EMAIL_DELIVERY_ENABLED=true` applies only to production; deploy-preview is explicitly false, preventing scheduled test notifications. Payments remain disabled in every context. No billing upgrade or paid AI gateway was enabled.
- Created a distinct standard Brevo SMTP key for Supabase Auth. Custom SMTP is enabled with the account's observed SMTP login, relay host, port 587 and verified GazaWorks sender. The settings were saved (Save changes disabled after submission). A dashboard promotional overlay initially prevented the save; it was dismissed without weakening any security control. Email confirmation remains enabled. This is configuration evidence, not yet a delivery receipt.
- The assistant, talent search and CV generation endpoints now require explicit boolean consent server-side. CV manual saving remains independent of AI consent. The CV builder and assistant send the actual consent state; unconsented requests never reach the provider. Six-language consent text warns that Gemini free-tier data may be used for product improvement and excludes secrets/identity documents/sensitive content.
- TypeScript, ESLint and 210 unit tests passed, including eight new consent/authentication cases. The provider calls are mocked only in unit tests; live AI and email acceptance still require deployed end-to-end checks.
- Remaining integration checks: real transactional email and Auth recovery delivery; a signed-in Gemini generation; Google OAuth configuration; account/staff journeys, storage and mobile checks; isolated restore rehearsal. Production remains unpublished until those release gates are resolved.
