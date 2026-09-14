# GazaWorks engineering guide
- Preserve the three immutable account types and financial invariants.
- Keep privileged credentials server-only. Never prefix secrets with `NEXT_PUBLIC_`.
- Every new user-data table must enable RLS and receive deliberate policies.
- AI cannot verify, adjudicate, ban, transfer funds, or author authoritative accounting.
- Payment amounts are integer minor units; ledger logic must stay deterministic.
- Add translation keys for all supported locales when extending important UI.
- Run `npm run check` and add migration coverage for schema changes.
