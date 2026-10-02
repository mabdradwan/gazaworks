"use client";
import {type FormEvent,useState} from "react";
import Link from "next/link";
import {authCopy} from "@/lib/auth-copy";
import {supabaseBrowser} from "@/lib/supabase/client";
import {replaceRecoveredPassword,sendRecoveryLink} from "@/domain/password-recovery";
import type {Locale} from "@/lib/i18n";

const recoveryCopy:Record<Locale,{invalid:string;unavailable:string;cleanup:string}>={
  ar:{invalid:"رابط إعادة التعيين غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من المتصفح الذي ستستخدمه لفتحه.",unavailable:"استعادة كلمة المرور غير متاحة مؤقتًا. حاول لاحقًا.",cleanup:"تم تغيير كلمة المرور، لكن تعذّر إنهاء الجلسات. سجّل الخروج من إعدادات حسابك."},
  en:{invalid:"The reset link is invalid or expired. Request a new link in the browser where you will open it.",unavailable:"Password recovery is temporarily unavailable. Try again later.",cleanup:"Your password changed, but sessions could not be signed out. Sign out in your account settings."},
  tr:{invalid:"Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Açacağınız tarayıcıdan yeni bir bağlantı isteyin.",unavailable:"Şifre kurtarma geçici olarak kullanılamıyor. Daha sonra tekrar deneyin.",cleanup:"Şifreniz değiştirildi ancak oturumlar kapatılamadı. Hesap ayarlarından çıkış yapın."},
  es:{invalid:"El enlace no es válido o ha caducado. Solicita uno nuevo en el navegador donde lo abrirás.",unavailable:"La recuperación de contraseña no está disponible temporalmente. Inténtalo más tarde.",cleanup:"Tu contraseña cambió, pero no se pudieron cerrar las sesiones. Cierra sesión en los ajustes de tu cuenta."},
  fr:{invalid:"Le lien est invalide ou expiré. Demandez un nouveau lien dans le navigateur où vous l’ouvrirez.",unavailable:"La récupération du mot de passe est temporairement indisponible. Réessayez plus tard.",cleanup:"Votre mot de passe a changé, mais les sessions n’ont pas pu être fermées. Déconnectez-vous dans les paramètres du compte."},
  de:{invalid:"Der Link ist ungültig oder abgelaufen. Fordern Sie einen neuen Link im Browser an, in dem Sie ihn öffnen werden.",unavailable:"Die Passwortwiederherstellung ist vorübergehend nicht verfügbar. Versuchen Sie es später erneut.",cleanup:"Ihr Passwort wurde geändert, aber die Sitzungen konnten nicht abgemeldet werden. Melden Sie sich in den Kontoeinstellungen ab."},
};

export function ResetPasswordForm({locale,mode,enabled,sessionReady}:{locale:Locale;mode:"request"|"update";enabled:boolean;sessionReady:boolean}) {
  const copy=authCopy(locale),detail=recoveryCopy[locale],updating=mode==="update";
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[success,setSuccess]=useState(false),[completed,setCompleted]=useState(false);
  const blocked=!enabled||(updating&&!sessionReady);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(busy||blocked||completed)return;
    const form=event.currentTarget,fields=new FormData(form);
    setBusy(true);setMessage("");setSuccess(false);
    try {
      const db=supabaseBrowser();
      if(!updating) {
        const result=await sendRecoveryLink(db,String(fields.get("email")??""),location.origin,locale);
        setSuccess(result==="sent");setMessage(result==="sent"?copy.resetSent:copy.failed);
      } else {
        const result=await replaceRecoveredPassword(db,String(fields.get("password")??""),String(fields.get("confirmation")??""));
        if(result==="updated"||result==="updated_session_active") {
          form.reset();setCompleted(true);setSuccess(true);setMessage(result==="updated"?copy.passwordUpdated:detail.cleanup);
        } else setMessage(result==="invalid_password"?copy.passwordMismatch:result==="invalid_session"?detail.invalid:copy.failed);
      }
    } catch {setMessage(copy.failed);} finally {setBusy(false);}
  }
  return <form className="card grid" onSubmit={submit} aria-busy={busy}>
    <h1>{updating?copy.newPassword:copy.resetTitle}</h1>
    {!enabled&&<p className="error" role="status">{detail.unavailable}</p>}
    {enabled&&updating&&!sessionReady&&<p className="error" role="status">{detail.invalid}</p>}
    {!completed&&<>
      {updating?<>
        <label>{copy.newPassword}<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required disabled={blocked||busy}/></label>
        <label>{copy.confirmPassword}<input name="confirmation" type="password" autoComplete="new-password" minLength={10} maxLength={128} required disabled={blocked||busy}/></label>
      </>:<label>{copy.email}<input name="email" type="email" autoComplete="email" required maxLength={254} disabled={blocked||busy}/></label>}
      <button className="btn" disabled={blocked||busy}>{busy?copy.wait:updating?copy.updatePassword:copy.resetButton}</button>
    </>}
    {message&&<p role="status" className={success?"success":"error"}>{message}</p>}
    {updating&&!sessionReady&&<Link href={`/${locale}/auth/reset`}>{copy.resetButton}</Link>}
    <Link href={`/${locale}/auth`}>{copy.back}</Link>
  </form>;
}
