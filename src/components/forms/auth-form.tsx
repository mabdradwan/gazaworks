"use client";

import { FormEvent, useState } from "react";
import { BriefcaseBusiness, Eye, EyeOff, UserRound, UsersRound } from "lucide-react";
import { ACCOUNT_TYPES, type AccountType } from "@/domain/marketplace";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uiCopy } from "@/lib/ui-copy";

const authDetails: Record<string, {
  accountHelp: string;
  individual: string;
  team: string;
  client: string;
  passwordHint: string;
  showPassword: string;
  hidePassword: string;
}> = {
  ar: {
    accountHelp: "اختر نوع الحساب بعناية. هذا الاختيار يحدد تجربة ملفك ومساحة العمل.",
    individual: "للمستقلين والمحترفين الأفراد داخل غزة.",
    team: "للفرق والوكالات والشركات الناشئة والمجموعات المهنية داخل غزة.",
    client: "للعملاء والشركات والمؤسسات والجهات الداعمة خارج غزة.",
    passwordHint: "استخدم 10 أحرف على الأقل.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
  en: {
    accountHelp: "Choose carefully. Your account type shapes your profile and workspace experience.",
    individual: "For independent professionals and individual talent based in Gaza.",
    team: "For teams, agencies, startups, and professional groups based in Gaza.",
    client: "For clients, companies, organizations, and supporters outside Gaza.",
    passwordHint: "Use at least 10 characters.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  tr: {
    accountHelp: "Dikkatle seçin. Hesap türünüz profilinizi ve çalışma alanı deneyiminizi belirler.",
    individual: "Gazze’de yaşayan bağımsız profesyoneller ve bireysel yetenekler için.",
    team: "Gazze’deki ekipler, ajanslar, girişimler ve profesyonel gruplar için.",
    client: "Gazze dışındaki müşteriler, şirketler, kuruluşlar ve destekçiler için.",
    passwordHint: "En az 10 karakter kullanın.",
    showPassword: "Şifreyi göster",
    hidePassword: "Şifreyi gizle",
  },
  es: {
    accountHelp: "Elige con cuidado. El tipo de cuenta define tu perfil y la experiencia de tu espacio de trabajo.",
    individual: "Para profesionales independientes y talento individual ubicado en Gaza.",
    team: "Para equipos, agencias, startups y grupos profesionales de Gaza.",
    client: "Para clientes, empresas, organizaciones y personas de apoyo fuera de Gaza.",
    passwordHint: "Usa al menos 10 caracteres.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
  },
  fr: {
    accountHelp: "Choisissez avec soin. Le type de compte définit votre profil et votre espace de travail.",
    individual: "Pour les professionnels indépendants et talents individuels basés à Gaza.",
    team: "Pour les équipes, agences, startups et groupes professionnels basés à Gaza.",
    client: "Pour les clients, entreprises, organisations et soutiens hors de Gaza.",
    passwordHint: "Utilisez au moins 10 caractères.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  de: {
    accountHelp: "Wählen Sie sorgfältig. Der Kontotyp bestimmt Ihr Profil und Ihren Arbeitsbereich.",
    individual: "Für selbstständige Fachkräfte und Einzelpersonen mit Sitz in Gaza.",
    team: "Für Teams, Agenturen, Startups und professionelle Gruppen in Gaza.",
    client: "Für Kunden, Unternehmen, Organisationen und Unterstützer außerhalb Gazas.",
    passwordHint: "Verwenden Sie mindestens 10 Zeichen.",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort ausblenden",
  },
};

export function AuthForm({
  locale,
  initialMode = "signin",
  initialAccountType,
}: {
  locale: string;
  initialMode?: "signin" | "register";
  initialAccountType?: AccountType;
}) {
  const ui = uiCopy(locale).auth;
  const detail = authDetails[locale] ?? authDetails.en;
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [accountType, setAccountType] = useState<AccountType | "">(initialAccountType ?? "");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const accountOptions = [
    { value: "individual" as const, title: ui.individual, body: detail.individual, Icon: UserRound },
    { value: "team" as const, title: ui.team, body: detail.team, Icon: UsersRound },
    { value: "client" as const, title: ui.client, body: detail.client, Icon: BriefcaseBusiness },
  ];

  function changeMode(nextMode: "signin" | "register") {
    setMode(nextMode);
    setNotice("");
    setSuccess(false);
  }

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

      const selectedType = String(form.get("accountType")) as AccountType;
      if (!ACCOUNT_TYPES.includes(selectedType)) {
        setNotice(ui.chooseAccount);
        return;
      }

      const { error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: selectedType,
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
      <div className="tabs auth-tabs" role="tablist">
        <button
          type="button"
          className={mode === "signin" ? "btn" : "btn secondary"}
          aria-pressed={mode === "signin"}
          onClick={() => changeMode("signin")}
        >
          {ui.signIn}
        </button>
        <button
          type="button"
          className={mode === "register" ? "btn" : "btn secondary"}
          aria-pressed={mode === "register"}
          onClick={() => changeMode("register")}
        >
          {ui.createAccount}
        </button>
      </div>

      <h1>{mode === "signin" ? ui.welcomeBack : ui.join}</h1>

      <form className="grid auth-form" onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>
              {ui.fullName}
              <input name="name" minLength={2} maxLength={100} required />
            </label>

            <fieldset className="auth-account-fieldset">
              <legend>{ui.accountType}</legend>
              <p>{detail.accountHelp}</p>
              <div className="auth-account-grid">
                {accountOptions.map(({ value, title, body, Icon }) => (
                  <label
                    key={value}
                    className={`auth-account-option${accountType === value ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={value}
                      checked={accountType === value}
                      onChange={() => setAccountType(value)}
                      required
                    />
                    <span className="auth-account-icon"><Icon size={20} /></span>
                    <span>
                      <strong>{title}</strong>
                      <small>{body}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <label>
          {ui.email}
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label>
          {ui.password}
          <span className="auth-password-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={10}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? detail.hidePassword : detail.showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {mode === "register" && <small className="auth-field-hint">{detail.passwordHint}</small>}
        </label>

        <button className="btn auth-submit" disabled={busy}>
          {busy ? ui.pleaseWait : mode === "signin" ? ui.signIn : ui.createSecure}
        </button>
      </form>

      <div className="auth-divider" aria-hidden="true"><span /></div>

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
