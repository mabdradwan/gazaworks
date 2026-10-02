"use client";
import {latinLocale} from "@/lib/formatting";

import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
import {directHireCopy} from "@/lib/direct-hire-copy";

type Hire={id:string;client_id:string;talent_id:string;title:string;description:string;budget_minor?:number|null;currency?:string|null;desired_delivery_at?:string|null;status:string;converted_work_request_id?:string|null;created_at:string;client?:{display_name?:string}|null;talent?:{display_name?:string;account_type?:string}|null};
type Me={id?:string;account_type?:string};

export function DirectHirePanel({locale="en"}:{locale?:string}){
  const c=directHireCopy(locale),[items,setItems]=useState<Hire[]>([]),[me,setMe]=useState<Me>({}),[message,setMessage]=useState("");
  async function load(){const [r,p]=await Promise.all([apiFetch("/api/direct-hire"),apiFetch("/api/profile")]);if(r.ok)setItems(await r.json());if(p.ok){const d=await p.json();setMe({id:d.id,account_type:d.account_type})}}
  useEffect(()=>{void load()},[]);
  async function act(id:string,action:"accept"|"decline"|"withdraw"){const r=await apiFetch("/api/direct-hire",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action})});setMessage(r.ok?(action==="accept"?c.accepted:action==="decline"?c.declined:c.withdrawn):c.failed);if(r.ok)await load()}
  return <div className="grid">{message&&<p role="status">{message}</p>}{items.length?items.map(x=>{
    const mine=x.client_id===me.id,isTalent=x.talent_id===me.id;
    const money=x.budget_minor?new Intl.NumberFormat(latinLocale(c.language),{style:"currency",currency:x.currency??"USD"}).format(x.budget_minor/100):null;
    return <article className="card request-card" key={x.id}><div className="card-head"><div><span className="badge">{c.statuses[x.status]??x.status.replaceAll("_"," ")}</span><h2>{x.title}</h2></div>{money&&<strong>{money}</strong>}</div><p className="muted">{x.description}</p><div className="meta-grid"><span>{c.client}: <strong>{x.client?.display_name??"—"}</strong></span><span>{c.talent}: <strong>{x.talent?.display_name??"—"}</strong></span>{x.desired_delivery_at&&<span>{c.delivery}: {new Date(x.desired_delivery_at).toLocaleDateString(latinLocale(c.language))}</span>}</div>{x.converted_work_request_id&&<code>{c.workRequest}: {x.converted_work_request_id}</code>}{x.status==="sent"&&<div className="form-actions">{isTalent&&<><button className="btn" onClick={()=>void act(x.id,"accept")}>{c.accept}</button><button className="btn secondary" onClick={()=>void act(x.id,"decline")}>{c.decline}</button></>}{mine&&<button className="btn secondary" onClick={()=>void act(x.id,"withdraw")}>{c.withdraw}</button>}</div>}</article>
  }):<div className="empty">{c.empty}</div>}</div>
}
