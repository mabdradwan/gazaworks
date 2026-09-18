# Important transactional email

The branch contains an operational outbox, a Resend adapter, a worker endpoint, signed delivery callbacks, and six-language administration/templates. **No real email was sent in this development session.** Production delivery remains disabled until the provider, sender domain and scheduler are configured and tested. Supabase Auth continues to own verification/reset emails; this queue does not replace its SMTP configuration.

## Events and privacy

| Event | Queue behavior |
| --- | --- |
| Verification | Verified, rejected, changes requested and suspended decisions. Routine review changes stay in-app. |
| Security | Important security notifications, including existing new-device alerts. |
| Payments/payouts | Important payment notices and payout status changes. Explicit simulator events are excluded. |
| Disputes/appeals | Both parties receive an in-app notice and an email job when the dispute/appeal status changes. |
| Account status | Suspension, ban, reactivation and deletion-pending notices. |
| Chat, appointments and ordinary activity | In-app only; no routine email. |

The database commits the notice and its queue record together. Recipient addresses come from confirmed Supabase Auth emails, never editable professional contact fields. The worker rechecks the confirmed destination before each attempt. The message contains a generic localized notice and a link into the authenticated account, not evidence, payment details, internal notes or login tokens. Outbox contents, addresses and suppression records are private; the admin queue returns a restricted operational projection.

## Configure a provider

1. Verify the organization's sender domain in Resend and configure its required DNS records. Use a sending API key scoped to the intended domain where supported.
2. Set server-only `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` (for example `GazaWorks <notifications@your-domain.example>`). Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin without a path, query or credentials.
3. Register the HTTPS webhook `/api/webhooks/email` for `email.delivered`, `email.bounced`, `email.complained`, `email.suppressed`, and `email.failed`. Save its signing secret in `RESEND_WEBHOOK_SECRET`.
4. Set a strong `CRON_SECRET`, then configure a trusted scheduler to call `GET` or `POST /api/cron/email-outbox` with `Authorization: Bearer <CRON_SECRET>`, initially every minute. Each invocation claims up to three notices. Monitor queue age and scale cadence/batch capacity deliberately for expected volume.
5. Complete a staged test using an owned test mailbox and the documented acceptance matrix. Only then set `EMAIL_DELIVERY_ENABLED=true` in the intended production environment. Non-production or self-hosted environments additionally need explicit `EMAIL_ALLOW_NON_PRODUCTION=true`; leave it false in ordinary previews.

The repository does not silently activate an email cron or change the hosting plan. The current daily marketplace timers are unsuitable for timely dispute email. The admin banner confirms only that sending environment values are present and syntactically valid; it does not prove scheduler health, domain verification, or recipient delivery.

The adapter uses the documented [send-email API](https://resend.com/docs/api-reference/emails/send-email). Other providers can implement `EmailProvider`; their idempotency retention and event semantics must also be reflected in the queue policy before activation.

## Delivery and retry semantics

- Claims use `FOR UPDATE SKIP LOCKED`, unique tokens and two-minute leases. A crashed worker can be retried without another worker claiming its live lease.
- The first prepared envelope is frozen. Template, sender and locale changes cannot change an already attempted message on retry.
- The idempotency key is `gazaworks-email/<outbox UUID>`. [Resend retains keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys); automated recovery stops after 23 hours from the first attempt and moves the item to `review_required`. Do not invent a new key to retry an uncertain send.
- 408, 429, network errors and 5xx responses retry with exponential backoff, initially up to five attempts. A permission-checked, audited manual retry can extend this up to ten total attempts within the same safe window. Sent, suppressed and review-required records cannot be resent through the UI.
- `sent` means **accepted by the provider**. Delivery is a separate field. `delivered` means the recipient's mail server accepted it, not that the person read it or that it landed in the inbox. [Provider delivery semantics](https://resend.com/docs/webhooks/emails/delivered).
- Callbacks verify the raw body with Svix HMAC, constant-time signature comparison, a five-minute timestamp tolerance and a 64 KiB body limit. Event IDs are idempotent. A per-provider-message transaction lock reconciles callbacks arriving before, during or after the send response. [Signature documentation](https://resend.com/docs/webhooks/verify-webhooks-requests), [independent Svix verification vector](https://docs.svix.com/receiving/verifying-payloads/how-manual).
- Permanent bounces, complaints and provider suppressions block subsequent mail to that address. Negative delivery events take precedence over delayed positive events. There is deliberately no blind “clear suppression and resend” button.

## Administration and templates

Staff need `email.manage`. Email Outbox provides filters, counts, pagination, attempt diagnostics, separate provider/delivery states and eligible retries. Email Templates loads the existing template before editing, supports all six languages, and records the responsible administrator atomically.

Supported template keys: `verification_status`, `payment_confirmation`, `payout_status`, `dispute_update`, `appeal_update`, `security_alert`, `account_notice`.

Supported placeholders: `{{subject}}`, `{{message}}`, `{{dashboard_url}}`, `{{platform_name}}`. Unknown placeholders and subject header injection are rejected. HTML placeholder values are escaped. Templates are trusted staff-authored HTML, never public user content. Missing translations use built-in copy in that same language; disabling a template suppresses newly prepared jobs. Already frozen retry envelopes retain their original content.

## Operations still requiring acceptance

Verify the sender domain and real API response, actual mailbox/server receipt, bounced-address handling, valid/invalid webhook requests, scheduler secret and cadence, preview isolation, and staff permissions in the hosted environment. Test Auth confirmation/reset separately through Supabase.

Monitor oldest queued age, stale processing leases, failed/suppressed/review-required counts, webhook failures and provider quotas. Keep notices accessible in-app if email is delayed. Provider-managed recovery of review-required/suppressed messages and automated external monitoring/retention are not implemented. The automated suite uses injected HTTP transports and real PostgreSQL concurrency; it does not establish deliverability.
