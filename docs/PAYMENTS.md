# Payment architecture

No real bank or card processor is installed. `PaymentProvider` is an adapter boundary with an explicit simulator; the application simulator commits payment events and ledger entries through `gw_mock_fund`. Production Vercel environments reject this route regardless of the database setting. Every simulated payment records `simulated=true` and must remain visibly identified as a development event.

All values are integer minor units. A transaction snapshots its deduction basis points. For gross 100000, a 700-basis-point deduction is 7000; an actual provider fee of 2500 leaves platform revenue 4500 and worker entitlement 93000. Provider cost is never assumed to be a fixed percentage. A fee exceeding the configured total deduction is rejected for reconciliation instead of silently increasing the worker's deduction.

Funding journals debit net provider cash and provider fee expense, and credit worker payable plus gross platform-fee revenue. A deferred PostgreSQL trigger requires each transaction/currency journal to balance. Ledger updates and deletes are disallowed to ordinary application roles, including the service API role.

An offer acceptance creates an immutable agreement. Funding is required before delivery. Delivery starts a 72-hour review deadline. Revision requests invalidate that delivery's timer; disputes freeze both acceptance and payout. Human decisions allocate the gross project amount between work awarded and refund due. The saved deduction rate applies once to the work award. Original funding values remain available; settlement amounts are recorded separately and adjusting journals reverse/reallocate the original liabilities.

A refund obligation is **not** a completed refund. The application does not falsely label real money as refunded. Actual refund execution, provider references, idempotent signed webhooks, reconciliation and refund confirmation require a real adapter and further implementation.

Manual payout recording requires approved → processing → paid (or failed/retry), a destination and reference, and no unresolved dispute/appeal. Recording a transfer does not execute a bank transfer. The amount is the authoritative entitlement, not an editable client value. Proof-document upload and configurable payout dates are still unfinished.

Financial analytics aggregate in the database, separate currencies, respect finance permissions and subtract recorded paid payouts. Real custody of third-party funds stays disabled pending provider/bank/legal/accounting approval. Do not market the development workflow as legally authorized escrow.
