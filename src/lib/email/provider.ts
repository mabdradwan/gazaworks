import "server-only";

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export interface EmailProvider {
  send(message: TransactionalEmail): Promise<void>;
}

export function emailIsConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL && process.env.CONTACT_RECIPIENT_EMAIL);
}

class BrevoEmailProvider implements EmailProvider {
  constructor(private readonly key: string, private readonly sender: string) {}

  async send(message: TransactionalEmail) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: { "api-key": this.key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: this.sender, name: "GazaWorks" },
        to: [{ email: message.to }],
        subject: message.subject,
        textContent: message.text,
        ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {}),
      }),
    });
    if (response.status !== 201) throw new Error(`Brevo delivery request failed (${response.status})`);
  }
}

export function emailProvider(): EmailProvider {
  if (!emailIsConfigured()) throw new Error("Transactional email is not configured");
  return new BrevoEmailProvider(process.env.BREVO_API_KEY!, process.env.BREVO_SENDER_EMAIL!);
}
