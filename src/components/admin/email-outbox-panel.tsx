"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {emailCopy,emailStatuses,type EmailStatus} from "@/lib/email-copy";
import type {EmailKind} from "@/domain/email";
import {isLocale} from "@/lib/i18n";
type Row={id:string;display_name:string;kind:EmailKind;locale:string;status:EmailStatus;attempts:number;max_attempts:number;next_attempt_at:string;created_at:string;delivery_status:string|null;last_error_code:string|null;can_retry:boolean};
type Queue={records:Row[];counts:Partial<Record<EmailStatus,number>>;total:number;providerConfigured:boolean};
export function EmailOutboxPanel({locale}:{locale:string}){
 const c=emailCopy(locale);
 const [queue,setQueue]=useState<Queue|null>(null),[page,setPage]=useState(0),[status,setStatus]=useState("");
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const generation=useRef(0),writing=useRef(false);
 const load=useCallback(async()=>{
  const current=++generation.current;setLoading(true);
  const response=await apiFetch(`/api/admin/email-outbox?page=${page}&status=${status}`),data=await response.json();
  if(current!==generation.current)return;
  if(response.ok)setQueue(data as Queue);
  else{setQueue(null);setMessage(emailCopy(locale).loadFailed);}
  setLoading(false);
 },[page,status,locale]);
 useEffect(()=>{void load();return()=>{generation.current++;};},[load]);
 async function retry(id:string){
  if(writing.current)return;
  writing.current=true;setBusy(true);setMessage("");
  try{
   const response=await apiFetch("/api/admin/email-outbox",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
   if(response.ok)await load();
   setMessage(response.ok?c.retried:c.retryFailed);
  }finally{writing.current=false;setBusy(false);}
 }
 function time(value:string){return new Intl.DateTimeFormat(isLocale(locale)?locale:"en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));}
 return <div className="grid" dir={locale==="ar"?"rtl":"ltr"}>
  <section className="card grid">
   <div className="form-actions"><h2 style={{flex:1}}>{c.title}</h2><button className="btn secondary" disabled={loading||busy} onClick={()=>{setMessage("");void load();}}>{c.refresh}</button></div>
   <p>{c.description}</p>{queue&&<p className="muted">{queue.providerConfigured?c.configured:c.disabled}</p>}
   {queue&&<div className="form-actions">{emailStatuses.map(value=><span className="badge" key={value}>{c.states[value]}: {queue.counts[value]??0}</span>)}</div>}
   <label>{c.filter}<select value={status} disabled={busy} onChange={e=>{setPage(0);setStatus(e.target.value);setMessage("");}}><option value="">{c.all}</option>{emailStatuses.map(value=><option key={value} value={value}>{c.states[value]}</option>)}</select></label>
   {message&&<p role="status">{message}</p>}
  </section>
  {loading?<p role="status">{c.loading}</p>:queue?.records.length===0?<p className="empty">{c.empty}</p>:queue?.records.map(row=><article className="card grid" key={row.id}>
   <div className="form-actions"><h3 style={{flex:1}}>{row.display_name} · {c.kinds[row.kind]}</h3><span className="badge">{c.states[row.status]}</span></div>
   <p className="muted">{c.created}: <time dateTime={row.created_at}>{time(row.created_at)}</time> · {c.attempts}: {row.attempts}/{row.max_attempts}</p>
   <p>{c.delivery}: {row.delivery_status?c.events[row.delivery_status]??c.noDelivery:c.noDelivery}</p>
   {row.status==="queued"&&<p>{c.next}: <time dateTime={row.next_attempt_at}>{time(row.next_attempt_at)}</time></p>}
   {row.status==="review_required"&&<p>{c.review}</p>}
   {row.last_error_code&&<details><summary>{c.diagnostic}</summary><code dir="ltr">{row.last_error_code}</code></details>}
   {row.can_retry&&<div><button className="btn secondary" disabled={busy||loading} onClick={()=>void retry(row.id)}>{c.retry}</button></div>}
  </article>)}
  {queue&&<nav className="form-actions" aria-label={c.page}><button className="btn secondary" disabled={page===0||loading||busy} onClick={()=>setPage(value=>value-1)}>{c.previous}</button><span>{c.page} {page+1} / {Math.max(1,Math.ceil(queue.total/25))}</span><button className="btn secondary" disabled={(page+1)*25>=queue.total||loading||busy} onClick={()=>setPage(value=>value+1)}>{c.nextPage}</button></nav>}
 </div>;
}
