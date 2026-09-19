"use client";

import { FormEvent, useState } from "react";
import { ACCOUNT_TYPES, type AccountType } from "@/domain/marketplace";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uiCopy } from "@/lib/ui-copy";

export function AuthForm({ locale }: { locale: string }) {
  const ui = uiCopy(locale).auth;
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      const db = supabaseBrowser();

      if (mode === "signin") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.assign(`/${locale}/dashboard`);
        return;
      }

      const accountType = String(form.get("accountType")) as AccountType;
      if (!ACCOUNT_TYPES.includes(accountType)) {
        setNotice(ui.chooseAccount);
        return;
      }

      const { error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: accountType,
            display_name: String(form.get("name")),
          },
          emailRedirectTo: `${location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (error) throw error;
      setNotice(ui.checkEmail);
      setSuccess(true);
    } catch {
      setNotice(ui.authFailed);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setNotice("");
    setSuccess(false);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    });
    if (error) setNotice(ui.authFailed);
  }

  return (
    <div className="card auth-card">
      <div className="tabs auth-tabs">
        <button
          type="button"
          className={mode === "signin" ? "btn" : "btn secondary"}
          onClick={() => setMode("signin")}
        >
          {ui.signIn}
        </button>
        <button
          type="button"
          className={mode === "register" ? "btn" : "btn secondary"}
          onClick={() => setMode("register")}
        >
          {ui.createAccount}
        </button>
      </div>

      <h1>{mode === "signin" ? ui.welcomeBack : ui.join}</h1>

      <form className="grid" onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>
              {ui.fullName}
              <input name="name" minLength={2} maxLength={100} required />
            </label>
            <label>
              {ui.accountType}
              <select name="accountType" required defaultValue="">
                <option value="" disabled>{ui.selectOne}</option>
                <option value="individual">{ui.individual}</option>
                <option value="team">{ui.team}</option>
                <option value="client">{ui.client}</option>
              </select>
            </label>
          </>
        )}

        <label>
          {ui.email}
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          {ui.password}
          <input
            name="password"
            type="password"
            minLength={10}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        <button className="btn" disabled={busy}>
          {busy ? ui.pleaseWait : mode === "signin" ? ui.signIn : ui.createSecure}
        </button>
      </form>

      <button
        type="button"
        className="btn secondary auth-google"
        onClick={() => void google()}
      >
        {ui.continueGoogle}
      </button>

      {notice && <p role="status" className={success ? "success" : "error"}>{notice}</p>}
      <a href={`/${locale}/auth/reset`} className="muted auth-forgot">{ui.forgotPassword}</a>
    </div>
  );
}
