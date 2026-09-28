import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AITask, aiProvider } from "@/lib/ai/provider";
import { rateLimit } from "@/lib/security";
import { supabaseServer } from "@/lib/supabase/server";

const schema = z.object({
  task: AITask.exclude(["talent_search"]),
  prompt: z.string().min(3).max(8000),
  locale: z.enum(["ar", "en", "tr", "es", "fr", "de"]),
  consentToExternalAI: z.literal(true),
});

export async function POST(request: NextRequest) {
  try {
    const db = await supabaseServer();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!rateLimit(`ai:${user.id}`, 10)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const input = schema.parse(await request.json());
    // Clients cannot assert database facts by attaching arbitrary grounding.
    const result = await aiProvider().complete({ task: input.task, prompt: input.prompt, locale: input.locale });
    const { error } = await db.from("ai_interactions").insert({
      profile_id: user.id, task: input.task, provider: result.provider, model: result.model,
      input_hash: "server-recorded", response: result.text, status: "draft",
    });
    if (error) return NextResponse.json({ error: "save_failed" }, { status: 503 });
    return NextResponse.json({ ...result, draft: true, requiresConfirmation: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "invalid_request" : "service_unavailable" },
      { status: error instanceof z.ZodError ? 400 : 503 });
  }
}
