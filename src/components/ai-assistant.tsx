"use client";

import { FormEvent, useState } from "react";
import { uiCopy } from "@/lib/ui-copy";

export function AIAssistant({
  locale = "en",
  mode = "faq",
}: {
  locale?: string;
  mode?: "faq" | "talent_search";
}) {
  const ui = uiCopy(locale).assistant;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const prompt = String(form.get("prompt") ?? "");
    const endpoint = mode === "talent_search" ? "/api/ai/talent-search" : "/api/ai";
    const body = mode === "talent_search"
      ? { prompt, locale }
      : { task: "faq", prompt, locale };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    setText(
      response.ok
        ? data.text
        : data.error === "service_unavailable"
          ? ui.unavailable
          : ui.failed,
    );
    setBusy(false);
  }

  return (
    <form className="card grid ai-assistant-card" onSubmit={submit}>
      <div>
        <span className="badge">GazaWorks AI</span>
        <h2>{mode === "talent_search" ? ui.talentTitle : ui.faqTitle}</h2>
        <p className="muted">
          {mode === "talent_search" ? ui.talentBody : ui.faqBody}
        </p>
      </div>
      <label>
        {ui.request}
        <textarea name="prompt" required minLength={5} rows={4} />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? ui.working : ui.ask}
      </button>
      {text && <div className="card ai-answer" style={{ whiteSpace: "pre-wrap" }}>{text}</div>}
    </form>
  );
}
