# Payments

`PaymentProvider` isolates intent, capture, and refund operations. The in-memory mock returns IDs prefixed `sim_`, sets `simulated: true`, and is development-only. Production refuses an unknown configured adapter rather than pretending success.

The target deduction defaults to 700 basis points in protected settings; provider fee is actual per transaction, never a guessed percentage. For $1,000 gross and $25 provider cost, deterministic logic records $70 deduction, $45 platform revenue, and $930 worker entitlement. Real custody, settlement, refund, KYC/AML, tax, and payout flows require legal/banking approval and a reviewed provider adapter.
