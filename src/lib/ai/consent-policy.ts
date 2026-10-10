/** A preference only; never used for account authorization or RLS. */
export const AI_CONSENT_VERSION = "2026-10-02";
export function hasAIConsent(metadata: Record<string, unknown> | undefined) {
  return metadata?.external_ai_consent_version === AI_CONSENT_VERSION;
}
export function aiConsentMetadata(accepted: boolean) {
  return { external_ai_consent_version: accepted ? AI_CONSENT_VERSION : null,
    external_ai_consent_at: accepted ? new Date().toISOString() : null,
    external_ai_consent_declined_at: accepted ? null : new Date().toISOString() };
}
