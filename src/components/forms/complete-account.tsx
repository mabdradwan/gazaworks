"use client";
import {useState,type FormEvent} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {uiCopy} from "@/lib/ui-copy";
import {aiLoginNotice} from "@/lib/ai/consent-copy";
import type {AccountType} from "@/domain/marketplace";
export function CompleteAccount({locale,next,name}:{locale:string;next:string;name:string}){
 const c=uiCopy(locale).auth,[kind,setKind]=useState<AccountType|"">(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!kind)return;const f=new FormData(e.currentTarget);setBusy(true);setError("");try{const r=await apiFetch("/api/auth/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountType:kind,displayName:f.get("name"),locale})});if(!r.ok)throw Error();location.assign(next)}catch{setError(c.authFailed);setBusy(false)}}
 return <form className="card auth-card grid" onSubmit={submit}><h1>{c.chooseAccount}</h1><label>{c.fullName}<input name="name" defaultValue={name} required minLength={2} maxLength={100} disabled={busy}/></label><fieldset disabled={busy}><legend>{c.accountType}</legend>{([['individual',c.individual],['team',c.team],['client',c.client]] as const).map(([value,label])=><label className="auth-account-option" key={value}><input type="radio" name="accountType" value={value} checked={kind===value} onChange={()=>setKind(value)} required/>{label}</label>)}</fieldset><p className="muted">{(aiLoginNotice[locale as keyof typeof aiLoginNotice]??aiLoginNotice.en)}</p><button className="btn" disabled={busy||!kind}>{busy?c.pleaseWait:c.createSecure}</button>{error&&<p role="alert">{error}</p>}</form>;
}
