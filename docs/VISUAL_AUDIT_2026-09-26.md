# GazaWorks visual and functional audit — 2026-09-26

## Scope and baseline

- Audited the live Netlify site at `https://gazaworks.netlify.app` and current GitHub `main` (`ecea9d8`). The live site was left unchanged.
- Visited English and Arabic homepages, the Arabic journal, and the registration form for individual, team and client. Each route preselected the correct account type. Opened the language menu and confirmed its six choices. Switching language from the team registration form lost both `mode=register` and `type=team` in the live version.
- The live hero image file could not be decoded by the local image decoder; the hero image container was 832px wide while its grid column was smaller and visibly obscured the heading and body in both directions.
- The journal showed seven manually selected source summaries, not an automatic news feed. Its daily review/publishing claim was unsupported. The seven original article URLs were checked against their publishers' indexed pages; the deployed site showed repetitive imagery and duplicate source labels.

## Changes prepared in this branch

- Replaced the unusable hero image with an optimized 1586×992 conceptual brand visual (140 KB WebP). This is illustrative imagery, not a photograph of a verified GazaWorks member.
- Sized the hero media to its grid column and protected both columns from overflow. Initial page headings now render visibly without waiting for client animation; other gentle motion remains.
- Kept the current registration type, mode and page query when switching locale. Localized language and mobile navigation labels across all six locales.
- Reworded journal text in six languages to describe selected reporting accurately; retained links and dates to the original publishers, sorted source summaries by source date, and avoided duplicate summaries and redundant credit labels.
- Changed home journal cards to request the publisher image and fall back to a neutral branded visual if loading fails. The source image proxy now rejects foreign hosts, non-image paths, redirects, SVG, and oversized responses.
- Added source image proxy regression tests covering host/path checks, redirect rejection, media type rejection, size cap and successful raster responses.
- Removed live payment and custody promises from six-language marketing copy. The simulated funding control and API are restricted to development; payment gateways remain disabled in production.

## Verification and remaining work

- `npm run check` passed after the repairs (TypeScript, ESLint, 11 tests, production build). Existing lint warnings remain. A local production HTTP smoke returned 200 for the homepage and 140 KB hero WebP; simulated funding returned 404 even with `PAYMENT_PROVIDER=mock` in production mode.
- The Cloud Browser was blocked from opening the local server (`ERR_BLOCKED_BY_CLIENT`), so the corrected layout has **not** received a visual browser screenshot. It must be checked on phone and desktop before deployment.
- No signed-in individual, team or client journey has been exercised against this latest build. The more extensive Auth/database tests on draft PR #4 are on a separate, unmerged branch; their migration `0011` and later changes are absent from production. Production Supabase currently lists only migrations `0001`–`0010`.
- Supabase security advisors reported a generic warning for `public.has_permission(text)` (the function only checks permissions of the current `auth.uid()`) and disabled leaked-password protection. Supabase documents the latter feature as available on paid Pro and higher plans, which conflicts with the current no-paid-services constraint.
- Automated news ingestion is not implemented; the journal is manually curated with original source links. Payment gateways remain out of scope by user instruction.
- The public Contact page currently directs users to sign in and offers no working inbound contact form; this needs an intentional communication route before launch.
- Do not merge to a Netlify-triggered branch or deploy without the user's approval: builds and deploy previews can use their Netlify credits.
