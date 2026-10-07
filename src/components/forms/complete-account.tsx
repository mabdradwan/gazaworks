"use client";
import {useState,type FormEvent} from "react";
import {BriefcaseBusiness,UserRound,UsersRound} from "lucide-react";
import {apiFetch} from "@/lib/api-fetch";
import {uiCopy} from "@/lib/ui-copy";
import {aiLoginNotice} from "@/lib/ai/consent-copy";
import type {AccountType} from "@/domain/marketplace";
export function CompleteAccount({locale,next,name}:{locale:string;next:string;name:string}){
 const c=uiCopy(locale).auth,[kind,setKind]=useState<AccountType|"">(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!kind)return;setBusy(true);setError("");try{const r=await apiFetch("/api/auth/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountType:kind,displayName:name.length>=2?name:"GazaWorks user",locale})});if(!r.ok)throw Error();location.assign(next)}catch{setError(c.authFailed);setBusy(false)}}
 return <form className="card auth-card grid" onSubmit={submit}>
  <h1>{c.chooseAccount}</h1>
  <fieldset className="auth-account-fieldset" disabled={busy}>
   <legend>{c.accountType}</legend>
   <div className="auth-account-grid">
    {([['individual',c.individual,UserRound],['team',c.team,UsersRound],['client',c.client,BriefcaseBusiness]] as const).map(([value,label,Icon])=><label className={`auth-account-option${kind===value?' selected':''}`} key={value}>
     <input type="radio" name="accountType" value={value} checked={kind===value} onChange={()=>setKind(value)} required/>
     <span className="auth-account-icon" aria-hidden="true"><Icon size={20}/></span>
     <span className="auth-account-text"><strong>{label}</strong></span>
    </label>)}
   </div>
  </fieldset>
  <p className="muted">{(aiLoginNotice[locale as keyof typeof aiLoginNotice]??aiLoginNotice.en)}</p>
  <button className="btn" disabled={busy||!kind}>{busy?c.pleaseWait:c.createAccount}</button>
  {error&&<p role="alert">{error}</p>}
 </form>;
}
