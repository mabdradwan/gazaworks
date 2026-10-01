"use client";

import { FormEvent, useState } from "react";
import { uiCopy } from "@/lib/ui-copy";
import { aiConsentCopy } from "@/lib/ai/consent-copy";
import { isLocale } from "@/lib/i18n";

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
    if(busy)return;
    const form = new FormData(event.currentTarget);
    const consentToExternalAI=form.get("aiConsent")==="on";
    if(!consentToExternalAI)return;
    setBusy(true);
    const prompt = String(form.get("prompt") ?? "");
    const endpoint = mode === "talent_search" ? "/api/ai/talent-search" : "/api/ai";
    const body = mode === "talent_search"
      ? { prompt, locale, consentToExternalAI }
      : { task: "faq", prompt, locale, consentToExternalAI };

    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await response.json();
      setText(response.ok ? data.text : ["service_unavailable","ai_unavailable","ai_not_configured"].includes(data.error) ? ui.unavailable : ui.failed);
    } catch { setText(ui.failed); }
    finally { setBusy(false); }
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
        <textarea name="prompt" required minLength={5} maxLength={mode==="talent_search"?2000:8000} rows={4} disabled={busy} />
      </label>
      <label className="consent-control"><input name="aiConsent" type="checkbox" required disabled={busy}/>{aiConsentCopy[isLocale(locale) ? locale : "en"]}</label>
      <button className="btn" disabled={busy}>
        {busy ? ui.working : ui.ask}
      </button>
      {text && <div className="card ai-answer" role="status" style={{ whiteSpace: "pre-wrap" }}>{text}</div>}
    </form>
  );
}
