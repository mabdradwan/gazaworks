import { NextRequest } from "next/server";
import { contactInput, isSameOriginHost } from "@/lib/contact";
import { emailIsConfigured, emailProvider } from "@/lib/email/provider";
import { rateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!emailIsConfigured()) return Response.json({ error: "unavailable" }, { status: 503 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isSameOriginHost(origin, host)) return Response.json({ error: "forbidden" }, { status: 403 });
  const ip = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 3, 600_000)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const parsed = contactInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  if (parsed.data.website) return Response.json({ ok: true }); // bot honeypot

  try {
    const { name, email, topic, message } = parsed.data;
    await emailProvider().send({
      to: process.env.CONTACT_RECIPIENT_EMAIL!,
      subject: `GazaWorks contact: ${topic}`,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
      replyTo: email,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "delivery_failed" }, { status: 503 });
  }
}
