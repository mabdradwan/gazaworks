# Payments

`PaymentProvider` isolates intent, capture, and refund operations. The in-memory mock returns IDs prefixed `sim_`, sets `simulated: true`, and is development-only. Production refuses an unknown configured adapter rather than pretending success.

The selected future gateway is Bank of Palestine. Its public product page describes merchant online payment, international cards and multiple currencies, but does not give this repository a merchant API contract. The client-facing payment option is therefore clearly inactive and cannot collect card details or mark a project funded. The adapter must be implemented only against the bank's actual merchant specification, with server-side verification, signed event validation, reconciliation, idempotency and refund support. `paymentProvider()` fails closed in production even if `PAYMENT_PROVIDER=mock` is set. Legal and banking approval for the platform-held workflow remains required before launch.

The target deduction defaults to 700 basis points in protected settings; provider fee is actual per transaction, never a guessed percentage. For $1,000 gross and $25 provider cost, deterministic logic records $70 deduction, $45 platform revenue, and $930 worker entitlement. Real custody, settlement, refund, KYC/AML, tax, and payout flows require legal/banking approval and a reviewed provider adapter.
