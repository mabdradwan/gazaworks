# GazaWorks integration checkpoint — 30 September 2026

This is a release gate, **not** a final-delivery certificate. PR #7 stays draft and the official Netlify production site remains on `main`.

## Verified in this checkpoint

- The integrated source builds and passes TypeScript, ESLint, and 171 unit tests locally. `npm audit` reports zero known vulnerabilities in the current lockfile; this is not a penetration test.
- The new authentication page probes a service-role-only marker installed by the last integrated migration. If the private server credential, database, or required schema is missing, email and Google submission fail closed and all six locales explain the temporary pause. The marker itself is read-only and grants no client access.
- The draft PR preview builds on Netlify. In the cloud browser, the Arabic and English desktop homepage, language switch, registration surface, and journal cards/source links rendered; the paused registration state was observed on the new preview. The Netlify Drawer error overlay is injected by Netlify, not by GazaWorks.
- Official Netlify project settings have `PAYMENT_PROVIDER=disabled` and `AI_PROVIDER=disabled` across contexts. The empty Gemini secret placeholder was removed. No bank payment, subscription, or paid AI plan was enabled.
- Supabase project is on the Free plan and still has only baseline migrations 0001–0010. The five integrated migrations remain unapplied to production. The upgraded runtime cannot be released safely against that baseline.

## Still required before final delivery

1. Create and verify an off-site logical database backup using a secure database connection. Supabase Free has no automatic downloadable backup. Rehearse the upgrade against an isolated copy, then apply reviewed migrations to production without resetting user data.
2. Configure the server-only Supabase service credential, scheduled-job secret, Auth email and Google OAuth, and Brevo sender/API integration. Independently test real delivery and confirmation. No credential should be committed or pasted into a public issue or log.
3. Obtain a valid Gemini Free-tier key through the user's Google AI Studio project, store it server-side in the official Netlify site, verify a harmless synthetic prompt, then enable `AI_PROVIDER=gemini`. Existing account/page access alone does not prove that a key is present or valid.
4. Exercise individual, team, client and staff journeys with disposable users against the upgraded database, including private RLS, storage, appointments, moderated chat, disputes, appeal timers, email, and administrative actions. Test small-screen layouts, RTL/LTR, screen readers, and failure states.
5. Add durable anti-abuse controls, malware/media processing, backup/monitoring operations and independent security/legal review. The Bank of Palestine adapter remains inactive until a future bank contract and compliance approval; never label an unfunded project as secured.

No production merge or production schema migration has been performed in this checkpoint.
