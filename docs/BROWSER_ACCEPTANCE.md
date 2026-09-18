# Hosted preview acceptance — September 17, 2026

Scope: a visitor opens the talent directory, chooses account creation, changes language, and reaches the correct localized authentication/recovery form. This pass verifies entry navigation, not a successful user registration or marketplace transaction.

## Tested source and deployment

- Source commit: `2bcdb8c29039419ee0acf34a40788e5c099d50a0`, branch `work`, draft [PR #4](https://github.com/mabdradwan/gazaworks/pull/4).
- [Vercel deployment](https://vercel.com/radwangaza2-9777/gazaworks/KwmcHRff2U7YhGbTnvbpXpNMxFcg) reported successful for that exact commit.
- [Quality gates](https://github.com/mabdradwan/gazaworks/actions/runs/35216999550) passed 146 SQL assertions, four independent-connection concurrency scenarios, 74 unit/integration tests, TypeScript, lint and the production build.
- The protected preview was opened using the owner's authorized Vercel browser session. Its stable branch alias is `https://gazaworks-git-work-radwangaza2-9777.vercel.app` and can change with later commits.
- Production remained at `main` commit `8cc5747`; no production promotion, live migration, provider activation or credential change was performed.

## Findings and verification

| Boundary | Before | After / evidence |
| --- | --- | --- |
| Private directory entry | A visitor could interact with the search form, then received “Search is temporarily unavailable.” | Hosted `/en/talent` renders a client sign-in explanation and Sign in / Create account links before any search or AI form. API tests distinguish 401 visitors from 403 accounts without permission. |
| Registration locale switch | Starting `/en/auth?mode=register` and choosing FR navigated to `/fr/auth`, showing “Bon retour” instead of registration. | Starting from the directory's Create account link, the AR language link retained `mode=register` and a localized `next=/ar/talent`. Arabic registration heading and the three-type selector remained present. |
| Login destination | Successful password sign-in always navigated to the dashboard. | The validated `next` destination is now used by password login, confirmation and OAuth. Unit tests reject external origins, callback routes, path traversal and token-bearing fragments. A real successful login has not been exercised. |
| Recovery locale switch | Language links removed `mode=update`; new-password labels were Arabic/English only. | Arabic recovery changed to `/fr/auth/reset?mode=update`; French update controls remained visible. No email was requested and no password entered or changed. |
| Desktop RTL | Not previously inspected on this branch. | Arabic registration screenshot shows RTL header, right-aligned form labels and the expected registration fields. This is not mobile or assistive-technology acceptance. |
| Private media policy | `img-src` and `media-src` allowed only the app origin, so configured Supabase signed media would be blocked. | CSP generation tests permit the configured project's `/storage/v1/` only, preserve private signed access, reject malformed origins, and remove production eval. Real image/video/voice playback remains pending an isolated fixture. |
| Release identity | `/api/version` returned a hardcoded release/date. | It now exposes actual Vercel commit, branch and environment metadata, or null/local outside Vercel. Direct browser navigation to this JSON endpoint was blocked by the browser client (`ERR_BLOCKED_BY_CLIENT`); the exact deployment was verified through its commit status instead. |

The Vercel log view had no request records in its selected 30-minute window. That empty window is not evidence of an error-free application. Browser extension diagnostics were separated from application diagnostics.

## Staging blocker

Read-only checks found:

- The same Supabase variable entries cover both Production and Preview in Vercel.
- Only the existing Supabase project is connected, with no branches.
- Live migrations stop at 0010. The new profile-provisioning/profile-save RPCs and email outbox do not exist there.

The pending atomic migration deliberately revokes old write paths. Applying it to that shared database before deploying the matching application would break the old production application. Do not seed fictional marketplace activity or enable payment simulation against that database.

Next: provision a separate staging project/branch, confirm its service cost, apply the source migration chain there, use preview-only Supabase credentials and canonical origin, configure allowed Auth callback URLs, then run the guarded fictional-user seed. Test hosted Auth, Storage, Realtime and every role/workflow before the coordinated production rollout in [DEPLOYMENT.md](DEPLOYMENT.md).

Vercel browser login does not repair the connector's OAuth grant: its project call still returned 403. Browser management is available without bypassing deployment protection.
# Language/navigation pass — 2026-09-17, source 5e896648

- CI run 35219640220 passed database checks, typecheck, lint, unit tests and production build; Vercel reported successful deployment.
- Branch preview: native language names, English → Arabic homepage, Arabic → French registration with `mode=register` retained.
- Escape from a language link closed the disclosure and returned focus to its trigger; clicking a page heading outside the menu closed it.
- No non-extension console errors were captured for these checked routes. This is not a site-wide error guarantee.
- New CSS implements short optional motion and reduced-motion overrides. Mobile viewport, reduced-motion emulation, screen-reader behavior and authenticated workspace remain unverified in this browser pass.
- No accounts, emails, password changes or financial transactions were created. Production and its database were not changed.
