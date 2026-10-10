'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/client';
import {apiFetch} from '@/lib/api-fetch';
import {sendRecoveryLink} from '@/domain/password-recovery';
import {ageFromBirthDate} from '@/domain/account-settings';
import {accountSettingsCopy} from '@/lib/account-settings-copy';
import {LoadingIndicator} from '@/components/loading-indicator';
export type AccountDetails={name:string;birth:string|null;individual:boolean;email:string;pendingEmail:string;google:boolean;typeLabel:string};
export function AccountSettings({locale,account}:{locale:string;account:AccountDetails}){
 const c=accountSettingsCopy(locale),router=useRouter();
 const [name,setName]=useState(account.name),[birth,setBirth]=useState(account.birth??''),[busy,setBusy]=useState(''),[notice,setNotice]=useState<{section:string;text:string;error:boolean}|null>(null);
 const age=ageFromBirthDate(birth);
 async function run(section:string,action:()=>Promise<string>){setBusy(section);setNotice(null);try{setNotice({section,text:await action(),error:false})}catch{setNotice({section,text:c.failed,error:true})}finally{setBusy('')}}
 function feedback(section:string){return <>{busy===section&&<LoadingIndicator locale={locale}/>} {notice?.section===section&&<p role={notice.error?'alert':'status'} className={notice.error?'error':'success'}>{notice.text}</p>}</>}
 return <div className="grid">
  <form className="card grid" onSubmit={e=>{e.preventDefault();void run('personal',async()=>{const response=await apiFetch('/api/account/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:name,...(account.individual?{dateOfBirth:birth}:{})})});if(!response.ok)throw Error();router.refresh();return c.saved})}}>
   <h2>{c.personal}</h2><p className="muted">{c.type}: {account.typeLabel}</p><div className="form-grid two"><label>{c.name}<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" disabled={!!busy}/></label>
   {account.individual&&<label>{c.birth}<input type="date" dir="ltr" lang="en" value={birth} onChange={e=>setBirth(e.target.value)} min="1900-01-01" max={new Date().toISOString().slice(0,10)} autoComplete="bday" disabled={!!busy}/>{age!==null&&<small className="muted">{c.age}: {age}</small>}</label>}</div><div className="form-actions"><button className="btn" disabled={!!busy}>{c.save}</button></div>{feedback('personal')}
  </form>
  <section className="card grid"><h2>{c.email}</h2><input value={account.email} readOnly dir="ltr" aria-label={c.email}/><p className="muted">{c.emailReadonly}</p></section>
  <section className="card grid"><h2>{c.password}</h2><p className="muted">{c.passwordHint}</p>{account.google&&<p className="muted">{c.google}</p>}<div className="form-actions"><button type="button" className="btn" disabled={!!busy||!account.email} onClick={()=>void run('password',async()=>{const db=supabaseBrowser();const {data,error}=await db.auth.getUser();if(error||!data.user?.email)throw Error();if(await sendRecoveryLink(db,data.user.email,window.location.origin,locale)!=='sent')throw Error();return c.passwordSent})}>{c.changePassword}</button></div>{feedback('password')}</section>
 </div>;
}
