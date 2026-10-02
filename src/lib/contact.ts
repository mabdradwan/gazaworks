import { z } from "zod";

export const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  topic: z.enum(["general", "verification", "technical"]),
  message: z.string().trim().min(15).max(3000),
  website: z.string().max(100).default(""),
});

export function isSameOriginHost(origin: string | null, host: string | null) {
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.host === host &&
      parsed.pathname === "/" && !parsed.search && !parsed.hash && !parsed.username && !parsed.password;
  } catch { return false; }
}
