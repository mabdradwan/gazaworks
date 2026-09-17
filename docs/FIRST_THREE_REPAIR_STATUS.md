# First three repair milestones

## 1. Fault inventory

| Priority | Reproduced evidence | Action |
| --- | --- | --- |
| Blocker | Connected database history ends at 0010; read-only pg_proc lookup finds neither gw_provision_profile nor gw_save_profile | Do not claim current preview supports new profile provisioning/saves. Coordinate schema and source deployment after isolated upgrade rehearsal. |
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

Password and immediate-session signup now await server verification of the profile before entering the workspace. The session endpoint rejects unauthenticated visitors, distinguishes a missing profile from database failure, and signs suspended/banned accounts out locally before returning a denial. No successful-login event is written for rejected accounts. OAuth recovery for missing account type opens the actual account selector and preserves safe next.

Still pending: live baseline alignment, configured Google and email confirmation/reset acceptance, cross-browser session refresh, and registration for each account type through actual Supabase Auth. Therefore milestones 2 and 3 are not declared fully complete.
