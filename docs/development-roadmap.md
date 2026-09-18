# Development roadmap

## Completed integration work in this branch

- Recover existing application, retain its design and workflows, and compare code with deployed/database state.
- Replace critical marketplace transitions with atomic database functions and explicit server authorization.
- Add real PostgreSQL regression coverage for RLS, finance, moderation, verification, disputes, appeals and role boundaries.
- Implement structured profile imports and editable private multilingual CV drafts.
- Improve admin payout/verification/moderation editors, currency-safe analytics, session refresh, file ownership checks and reproducible dependencies.
- Complete staff appointment creation, blocking, assignment, rescheduling, attendance and cancellation with applicant history, private notes, notifications and six-language controls.

- Implement important email queuing, retries, suppression, signed provider callbacks, six-language template/outbox administration and parallel-worker regression tests. Delivery remains disabled pending provider/scheduler acceptance.
- Embed administrative content in the responsive workspace shell and add six-language desktop/mobile navigation with authenticated staff entry.
- Restore authorized Vercel browser access; fix hosted registration/recovery locale-state loss, private-directory entry, safe login return paths and the storage-media CSP. Verify these public entry flows on the protected preview and record their limits.

## Next release sequence

1. Finish and validate the staged migration on isolated Supabase staging, using seeded fictional accounts and the exact tested application commit.
2. Bind Vercel Preview to the isolated staging database and complete authenticated browser testing. Browser project access is restored; the connector remains separately unauthorized. Do not migrate the live database behind an incompatible app.
3. Complete full six-language translations and RTL/mobile/accessibility acceptance across auth, dashboards, policies and administration.
4. Complete profile administration, account lifecycle, user reports and all remaining specialized admin screens.
5. Add media optimization/transcoding/thumbnails, malware quarantine and enforced configurable limits. Validate real Storage uploads and downloads.
6. Configure and accept the important-email provider/scheduler, reliable timer cadence, monitoring, backup restore and security settings.
7. Add scalable directory filtering/pagination, worker opportunity recommendations and validated AI recommendation/offer drafts; evaluate a real provider with non-sensitive fixtures first.
8. Integrate an approved payment provider, signed idempotent webhooks, real refunds/reconciliation and payout proofs; complete financial/legal acceptance.
9. Run the full release acceptance matrix, record exact results and unresolved issues, then coordinate database/application rollout and recheck the live site.

No phase is considered complete solely because a table, button or generic JSON editor exists.
