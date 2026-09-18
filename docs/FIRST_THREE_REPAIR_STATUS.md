# First three repair milestones

Verification: source `fa1c611b162d9c95735bf2871b651886ac3477c1`, GitHub Actions run [35255953398](https://github.com/mabdradwan/gazaworks/actions/runs/35255953398), passed the upgrade rehearsal, PostgreSQL regression suite, TypeScript, ESLint, unit/integration tests and Next.js production build.

## 1. Fault inventory

| Priority | Reproduced evidence | Action |
| --- | --- | --- |
| Blocker | Connected database history ends at 0010; read-only pg_proc lookup finds neither gw_provision_profile nor gw_save_profile | Do not claim current preview supports new profile provisioning/saves. Coordinate schema and source deployment after isolated upgrade rehearsal. |
| Blocker | Live handle_new_user definition defaults missing account_type to client, including Google accounts | Pending 0011 removes this default. Do not advertise correct live Google account-type selection before deploying the compatible trigger/callback together. Do not silently convert existing account types. |
| High | Password login ignored the session endpoint response and redirected regardless of profile/account state | Require server-confirmed profile/status before navigating. Test all three active account types, suspended/banned, missing profile and database error. |
| High | OAuth account-type-required redirect opened sign-in mode and lost the intended destination | Redirect directly to registration with validated next preserved. |
| High | Existing fresh-database tests did not rehearse upgrading accounts created under 0010 | Add transactional legacy account upgrade rehearsal before normal migration suite. |
| Pending | Real Google/email/reset/session-refresh journeys not exercised against an isolated hosted Auth instance | Remains acceptance work; synthetic SQL and mocked route tests do not replace it. |

The full 65-section inventory is REQUIREMENTS_ACCEPTANCE.md. This focused pass is not an exhaustive reproduction of every button and every authenticated page.

## 2. Database compatibility

Read-only live checks confirmed the documented 0001–0010 baseline. No live migration or history repair was performed. The new check-database-compatibility.sql reports the three immediate authentication/profile prerequisites. It is a presence check, not a complete schema equivalence proof.

The free PostgreSQL CI harness now inserts fictional individual/team/client accounts under 0010, applies all three pending migrations in a transaction, checks identities/types/display names and required functions, then rolls the rehearsal back before the normal suite. This verifies an upgrade of the repository's baseline, not a clone of the exact live Supabase environment.

Production and Preview currently share the live database configuration according to the prior Vercel inspection. Do not seed that database or run the destructive harness against it. Local Docker/psql and installed npm dependencies are not available in this workspace; use the existing isolated GitHub Actions runner for tests. No paid project, branch, service or payment gateway is created.

## 3. Authentication

September 18: the new isolated real Supabase Auth/REST suite passed signup, confirmation, login, refresh, privacy, immutable types and password recovery for all three account types (run 35325047323). Extending the test through actual Next.js APIs reproduced a new failure: RLS hides suspended profiles, so the user-scoped status lookup returned a misleading missing-profile 409. The session endpoint now reads only the authenticated caller's status through the server-only admin client, after Auth identity validation. No profile details are returned to the caller by that lookup. Application-level regression run 35325775100 on `f74debb` passed real SSR session entry, own profile access and suspended rejection for all three types. The ordinary quality gates passed separately in run 35325775122. This accepts the isolated fix; hosted email/Google/browser acceptance and live migration remain pending.

Password and immediate-session signup now await server verification of the profile before entering the workspace. The session endpoint rejects unauthenticated visitors, distinguishes a missing profile from database failure, and signs suspended/banned accounts out locally before returning a denial. No successful-login event is written for rejected accounts. OAuth recovery for missing account type opens the actual account selector and preserves safe next.

Still pending: live baseline alignment, configured Google and email confirmation/reset acceptance, cross-browser session refresh, and registration for each account type through actual Supabase Auth. Therefore milestones 2 and 3 are not declared fully complete.
