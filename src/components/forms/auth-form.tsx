"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { type AccountType } from "@/domain/marketplace";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uiCopy } from "@/lib/ui-copy";
import {apiFetch} from "@/lib/api-fetch";
import {safeReturnPath} from "@/domain/navigation";
import {aiConsentMetadata} from "@/lib/ai/consent-policy";
import {aiLoginNotice} from "@/lib/ai/consent-copy";
import {isLocale} from "@/lib/i18n";
import {authCopy} from "@/lib/auth-copy";

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

const authUnavailable:Record<string,string>={
  ar:"التسجيل والدخول متوقفان مؤقتًا حتى يكتمل تحديث قاعدة البيانات وإعداد الأمان. لن يُنشأ حساب غير مكتمل.",
  en:"Sign-in and registration are temporarily paused until the database upgrade and security setup are complete. No incomplete account will be created.",
  tr:"Veritabanı yükseltmesi ve güvenlik kurulumu tamamlanana kadar giriş ve kayıt geçici olarak duraklatıldı. Eksik hesap oluşturulmaz.",
  es:"El acceso y el registro están pausados hasta completar la actualización de la base de datos y la seguridad. No se creará una cuenta incompleta.",
  fr:"La connexion et l’inscription sont suspendues jusqu’à la fin de la mise à niveau de la base de données et de la sécurité. Aucun compte incomplet ne sera créé.",
  de:"Anmeldung und Registrierung sind bis zum Abschluss des Datenbank-Upgrades und der Sicherheitseinrichtung pausiert. Es wird kein unvollständiges Konto erstellt.",
};

const googleUnavailable:Record<string,string>={
  ar:"الدخول عبر Google غير متاح حاليًا. استخدم البريد الإلكتروني.",
  en:"Google sign-in is currently unavailable. Use email instead.",
  tr:"Google ile giriş şu anda kullanılamıyor. E-posta kullanın.",
  es:"El acceso con Google no está disponible actualmente. Usa el correo electrónico.",
  fr:"La connexion avec Google est actuellement indisponible. Utilisez l’e-mail.",
  de:"Die Google-Anmeldung ist derzeit nicht verfügbar. Verwenden Sie E-Mail.",
};

export function AuthForm({
  locale,
  initialMode = "signin",
  errorCode,
  next,
  authEnabled=true,
  googleEnabled=false,appleEnabled=false,
}: {
  locale: string;
  initialMode?: "signin" | "register";
  initialAccountType?: AccountType;
  errorCode?:string;
  next?:string;
  authEnabled?:boolean;
  googleEnabled?:boolean;
  appleEnabled?:boolean;
}) {
  const ui = uiCopy(locale).auth;
  const errorCopy=authCopy(locale);
  const destination=safeReturnPath(next,locale);
  const detail = authDetails[locale] ?? authDetails.en;
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [notice, setNotice] = useState(errorCode==="account_type_required"?ui.chooseAccount:errorCode==="account_unavailable"?errorCopy.accountUnavailable:errorCode?ui.authFailed:"");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkMode,setLinkMode]=useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function changeMode(nextMode: "signin" | "register") {
    setMode(nextMode);
    setNotice("");
    setSuccess(false);
    const url=new URL(location.href);
    if(nextMode==="register")url.searchParams.set("mode","register");
    else {url.searchParams.delete("mode");url.searchParams.delete("type");}
    url.searchParams.delete("error");
    history.replaceState(null,"",url);
  }

  function callbackURL(){
    const url=new URL("/auth/callback",location.origin);
    url.searchParams.set("next",destination);
    url.searchParams.set("locale",locale);
    return url;
  }

  async function enterWorkspace(){
    const response=await apiFetch("/api/security/session",{method:"POST"});
    if(!response.ok){
      const result:unknown=await response.json();
      const code=typeof result==="object"&&result!==null&&"error" in result?result.error:null;
      if(code==="account_type_required"){location.assign(destination);return;}
      if(code==="account_unavailable")throw new Error(errorCopy.accountUnavailable);
      throw new Error(ui.authFailed);
    }
    location.assign(destination);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authEnabled || busy) return;
    setBusy(true);
    setNotice("");
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    try {
      const db = supabaseBrowser();

      if(linkMode){const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:callbackURL().toString(),data:{...aiConsentMetadata(true),locale}}});if(error)throw error;setNotice(ui.checkEmail);setSuccess(true);return;}
      if (mode === "signin") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const {data:{user:signedUser}}=await db.auth.getUser();
        if(!signedUser?.user_metadata?.external_ai_consent_declined_at){
          const {error:consentError}=await db.auth.updateUser({data:aiConsentMetadata(true)});
          if(consentError)setNotice(ui.authFailed);
        }
        await enterWorkspace();
        return;
      }

      const { data,error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...aiConsentMetadata(true),
            locale,
          },
          emailRedirectTo: callbackURL().toString(),
        },
      });

      if (error) throw error;
      if(data.session){await enterWorkspace();return;}
      setNotice(ui.checkEmail);
      setSuccess(true);
    } catch(e) {
      setNotice(e instanceof Error&&[ui.chooseAccount,errorCopy.accountUnavailable].includes(e.message)?e.message:ui.authFailed);
    } finally {
      setBusy(false);
    }
  }

  async function google(provider:"google"|"apple"="google") {
    if (!authEnabled || !(provider==="google"?googleEnabled:appleEnabled) || busy) return;
    setNotice("");
    setSuccess(false);
    setBusy(true);
    const callback=callbackURL();
    callback.searchParams.set("aiConsent","2026-10-02");
    try{
      const { error } = await supabaseBrowser().auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback.toString() },
      });
      if(error)setNotice(ui.authFailed);
    }catch{setNotice(ui.authFailed)}
    finally{setBusy(false)}
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
      {!authEnabled&&<p role="status" className="development-warning">{authUnavailable[locale]??authUnavailable.en}</p>}

      <form className="grid auth-form" onSubmit={submit}>
        <label>
          {ui.email}
          <input name="email" type="email" required autoComplete="email" disabled={!authEnabled || busy} />
        </label>

        {!linkMode&&<label>
          {ui.password}
          <span className="auth-password-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={mode === "register" ? 10 : 1}
              required
              disabled={!authEnabled || busy}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="auth-password-toggle"
              disabled={!authEnabled}
              aria-label={showPassword ? detail.hidePassword : detail.showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {mode === "register" && <small className="auth-field-hint">{detail.passwordHint}</small>}
        </label>}

        <p className="auth-field-hint">{aiLoginNotice[isLocale(locale)?locale:"en"]} <a href={`/${locale}/privacy`}>{isLocale(locale)&&locale==="ar"?"الخصوصية":"Privacy"}</a></p>
        <button className="btn auth-submit" disabled={busy||!authEnabled}>
          {busy ? ui.pleaseWait : linkMode ? ({ar:"إرسال رابط الدخول",en:"Send sign-in link",tr:"Giriş bağlantısı gönder",es:"Enviar enlace de acceso",fr:"Envoyer le lien de connexion",de:"Anmeldelink senden"}[locale]??"Send sign-in link") : mode === "signin" ? ui.signIn : ui.createAccount}
        </button>
      </form>

      <button type="button" className="btn secondary auth-google" disabled={busy||!authEnabled} onClick={()=>{setLinkMode(v=>!v);setNotice("");setSuccess(false)}}>{linkMode?ui.password:({ar:"المتابعة عبر رابط البريد",en:"Continue with an email link",tr:"E-posta bağlantısıyla devam et",es:"Continuar con enlace por correo",fr:"Continuer par lien e-mail",de:"Mit E-Mail-Link fortfahren"}[locale]??"Continue with an email link")}</button>
      <div className="auth-divider" aria-hidden="true"><span /></div>

      <button
        type="button"
        className="btn secondary auth-google"
        disabled={busy||!authEnabled||!googleEnabled}
        onClick={() => void google()}
      >
        {ui.continueGoogle}
      </button>
      {appleEnabled&&<button type="button" className="btn secondary auth-google" disabled={busy||!authEnabled} onClick={()=>void google("apple")}>{ui.continueGoogle.replace("Google","Apple")}</button>}
      {authEnabled&&!googleEnabled&&<p className="auth-field-hint">{googleUnavailable[locale]??googleUnavailable.en}</p>}

      {notice && <p role="status" className={success ? "success" : "error"}>{notice}</p>}
      {authEnabled && <a href={`/${locale}/auth/reset`} className="muted auth-forgot">{ui.forgotPassword}</a>}
    </div>
  );
}
