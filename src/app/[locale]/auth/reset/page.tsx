"use client";
import {FormEvent,useState} from "react";
import {useParams,useSearchParams} from "next/navigation";
import {supabaseBrowser} from "@/lib/supabase/client";
import {authCopy} from "@/lib/auth-copy";

export default function Reset(){
  const params=useParams<{locale:string}>(),search=useSearchParams();
  const locale=params.locale??"en",t=authCopy(locale),updating=search.get("mode")==="update";
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false);

  async function requestReset(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const email=String(new FormData(e.currentTarget).get("email"));
    const callback=new URL("/auth/callback",location.origin);
    callback.searchParams.set("locale",locale);
    callback.searchParams.set("next","/"+locale+"/auth/reset?mode=update");
    const {error}=await supabaseBrowser().auth.resetPasswordForEmail(email,{redirectTo:callback.toString()});
    setMessage(error?error.message:t.resetSent);setBusy(false);
  }

  async function updatePassword(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const f=new FormData(e.currentTarget),password=String(f.get("password")),confirm=String(f.get("confirm"));
    if(password.length<10||password!==confirm){setMessage(locale==="ar"?"يجب أن تتطابق كلمتا المرور وأن تكونا 10 أحرف على الأقل.":"Passwords must match and be at least 10 characters.");setBusy(false);return}
    const db=supabaseBrowser(),{error}=await db.auth.updateUser({password});
    if(error){setMessage(error.message);setBusy(false);return}
    await db.auth.signOut();
    setMessage(locale==="ar"?"تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.":"Password updated. You can sign in now.");
    setBusy(false);
  }

  return <section className="container auth-wrap">
    <form className="card grid" onSubmit={updating?updatePassword:requestReset}>
      <h1>{t.resetTitle}</h1>
      {!updating?<label>{t.email}<input name="email" type="email" required autoComplete="email"/></label>:<>
        <label>{locale==="ar"?"كلمة المرور الجديدة":"New password"}<input name="password" type="password" minLength={10} required autoComplete="new-password"/></label>
        <label>{locale==="ar"?"تأكيد كلمة المرور":"Confirm password"}<input name="confirm" type="password" minLength={10} required autoComplete="new-password"/></label>
      </>}
      <button className="btn" disabled={busy}>{busy?t.wait:updating?(locale==="ar"?"تحديث كلمة المرور":"Update password"):t.resetButton}</button>
      <p role="status">{message}</p>
      <a href={"/"+locale+"/auth"} className="muted">{t.back}</a>
    </form>
  </section>
}
