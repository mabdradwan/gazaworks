"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const labels: Record<string, { signOut: string; signingOut: string }> = {
  en: { signOut: "Sign out", signingOut: "Signing out…" },
  ar: { signOut: "تسجيل الخروج", signingOut: "جارٍ تسجيل الخروج…" },
  tr: { signOut: "Çıkış yap", signingOut: "Çıkış yapılıyor…" },
  es: { signOut: "Cerrar sesión", signingOut: "Cerrando sesión…" },
  fr: { signOut: "Se déconnecter", signingOut: "Déconnexion…" },
  de: { signOut: "Abmelden", signingOut: "Abmeldung…" },
};

export function WorkspaceSignOut({ locale }: { locale: string }) {
  const ui = labels[locale] ?? labels.en;
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await supabaseBrowser().auth.signOut();
    window.location.assign(`/${locale}`);
  }

  return (
    <button
      className="workspace-signout"
      onClick={() => void signOut()}
      disabled={busy}
    >
      {busy ? ui.signingOut : ui.signOut}
    </button>
  );
}
