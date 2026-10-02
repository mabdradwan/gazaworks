# Public evaluation release - 2 October 2026

The owner explicitly requested publishing the current application for real-user evaluation and bank review. This supersedes the earlier instruction to keep PR #7 unpublished. It does not constitute final acceptance of the full product.

## Verified before publication

- TypeScript, ESLint, 245 unit tests and the Next.js production build pass.
- The Arabic public homepage and how-it-works page render with the light green visual system; homepage navigation was exercised in the cloud browser.
- The existing individual test account can save its professional profile, and Gemini can generate a reviewable CV draft from synthetic facts.
- Every public database table has RLS enabled. The security advisor still reports the intentionally callable permission helper and disabled leaked-password protection.
- Profile prices now accept normal currency amounts and convert to exact minor units. Arabic and English list separators are accepted. Saving disables duplicate submissions.
- The site includes a six-language beta/payment-unavailable notice, visible footer links to payment/dispute policies, and branded page metadata.

## Boundaries

Real payments and transfers remain disabled. Google OAuth is not configured. Full team/client/staff acceptance, mobile/browser coverage and storage upload acceptance remain incomplete. The attempted browser file upload stalled; no successful upload is claimed. Policy pages are drafts. The backup archive has not yet undergone an isolated restore rehearsal. This release is for evaluation, not a certificate of complete functionality or banking approval.
