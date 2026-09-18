"use client";
import {FormEvent,useState} from "react";
import {useParams,useSearchParams} from "next/navigation";
import {supabaseBrowser} from "@/lib/supabase/client";
import {authCopy} from "@/lib/auth-copy";

export default function Reset(){
  const params=useParams<{locale:string}>(),search=useSearchParams();
  const locale=params.locale??"en",t=authCopy(locale),updating=search.get("mode")==="update";
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const [updated,setUpdated]=useState(false);

  async function requestReset(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const email=String(new FormData(e.currentTarget).get("email"));
    const callback=new URL("/auth/callback",location.origin);
    callback.searchParams.set("locale",locale);
    callback.searchParams.set("next","/"+locale+"/auth/reset?mode=update");
    try{
      const {error}=await supabaseBrowser().auth.resetPasswordForEmail(email,{redirectTo:callback.toString()});
      setMessage(error?error.message:t.resetSent);
    }catch{setMessage(t.failed)}finally{setBusy(false)}
  }

  async function updatePassword(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const f=new FormData(e.currentTarget),password=String(f.get("password")),confirm=String(f.get("confirm"));
    if(password.length<10||password!==confirm){setMessage(t.passwordMismatch);setBusy(false);return}
    try{
      const db=supabaseBrowser(),{error}=await db.auth.updateUser({password});
      if(error)throw error;
      setUpdated(true);setMessage(t.passwordUpdated);
      await db.auth.signOut();
    }catch(e){setMessage(e instanceof Error?e.message:t.failed)}finally{setBusy(false)}
  }

  return <section className="container auth-wrap">
    <form className="card grid" onSubmit={updating?updatePassword:requestReset}>
      <h1>{t.resetTitle}</h1>
      {!updating?<label>{t.email}<input name="email" type="email" required autoComplete="email"/></label>:!updated&&<>
        <label>{t.newPassword}<input name="password" type="password" minLength={10} required autoComplete="new-password"/></label>
        <label>{t.confirmPassword}<input name="confirm" type="password" minLength={10} required autoComplete="new-password"/></label>
      </>}
      {!updated&&<button className="btn" disabled={busy}>{busy?t.wait:updating?t.updatePassword:t.resetButton}</button>}
      <p role="status">{message}</p>
      <a href={"/"+locale+"/auth"} className="muted">{t.back}</a>
    </form>
  </section>
}
