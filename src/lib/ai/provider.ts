import "server-only";
import { z } from "zod";

export const AITask = z.enum(["faq", "profile_draft", "cv_builder", "team_draft", "work_request", "talent_search", "writing"]);
export type AITask = z.infer<typeof AITask>;
type AIInput = { task: AITask; prompt: string; locale: string; grounding?: unknown };
type AIResult = { text: string; provider: string; model: string };

export interface AIProvider { complete(input: AIInput): Promise<AIResult> }

export class MockAIProvider implements AIProvider {
  async complete(input: AIInput): Promise<AIResult> {
    return { text: `Development AI is not connected. ${input.task.replace("_", " ")} needs a configured provider.`, provider: "mock", model: "none" };
  }
}

class OpenAICompatibleProvider implements AIProvider {
  constructor(private readonly key: string, private readonly base: string, private readonly model: string, private readonly provider: string) {}
  async complete(input: AIInput): Promise<AIResult> {
    const response = await fetch(`${this.base}/chat/completions`, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: `Assist with ${input.task} in ${input.locale}. Never verify users, decide disputes, move money, ban users, or invent database facts. Use supplied grounding only. This is a draft that the human must review.` },
          { role: "user", content: JSON.stringify({ prompt: input.prompt, grounding: input.grounding }) },
        ],
        temperature: 0.2,
      }),
    });
    if (!response.ok) throw new Error("AI provider request failed");
    const output = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1) }).parse(await response.json());
    return { text: output.choices[0].message.content, provider: this.provider, model: this.model };
  }
}

export function aiProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "gemini" && process.env.GEMINI_API_KEY) {
    return new OpenAICompatibleProvider(process.env.GEMINI_API_KEY, "https://generativelanguage.googleapis.com/v1beta/openai", process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite", "gemini");
  }
  if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAICompatibleProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1", process.env.OPENAI_MODEL ?? "gpt-4.1-mini", "openai-compatible");
  }
  if (process.env.NODE_ENV === "development" && process.env.AI_PROVIDER === "mock") return new MockAIProvider();
  throw new Error("AI provider is not configured");
}
