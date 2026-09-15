"use client";
import {useEffect,useState} from "react";

type Hire={id:string;client_id:string;talent_id:string;title:string;description:string;budget_minor?:number|null;currency?:string|null;desired_delivery_at?:string|null;status:string;converted_work_request_id?:string|null;created_at:string;client?:{display_name?:string}|null;talent?:{display_name?:string;account_type?:string}|null};
type Me={id?:string;account_type?:string};

export function DirectHirePanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[items,setItems]=useState<Hire[]>([]),[me,setMe]=useState<Me>({}),[message,setMessage]=useState("");
  async function load(){const [r,p]=await Promise.all([fetch("/api/direct-hire"),fetch("/api/profile")]);if(r.ok)setItems(await r.json());if(p.ok){const d=await p.json();setMe({id:d.id,account_type:d.account_type})}}
  useEffect(()=>{void load()},[]);
  async function act(id:string,action:"accept"|"decline"|"withdraw"){const r=await fetch("/api/direct-hire",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action})});const d=await r.json().catch(()=>({}));setMessage(r.ok?(action==="accept"?(ar?"تم قبول الطلب وتحويله إلى طلب عمل خاص.":"Request accepted and converted to a private work request."):action==="decline"?(ar?"تم رفض الطلب.":"Request declined."):(ar?"تم سحب الطلب.":"Request withdrawn.")):(d.error??(ar?"تعذّر تنفيذ الإجراء.":"Action failed.")));if(r.ok)await load()}
  return <div className="grid">{message&&<p role="status">{message}</p>}{items.length?items.map(x=>{
    const mine=x.client_id===me.id,isTalent=x.talent_id===me.id;
    const money=x.budget_minor?new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:x.currency??"USD"}).format(x.budget_minor/100):null;
    return <article className="card request-card" key={x.id}><div className="card-head"><div><span className="badge">{x.status.replaceAll("_"," ")}</span><h2>{x.title}</h2></div>{money&&<strong>{money}</strong>}</div><p className="muted">{x.description}</p><div className="meta-grid"><span>{ar?"العميل":"Client"}: <strong>{x.client?.display_name??"—"}</strong></span><span>{ar?"المحترف/الفريق":"Talent"}: <strong>{x.talent?.display_name??"—"}</strong></span>{x.desired_delivery_at&&<span>{ar?"موعد التسليم المطلوب":"Desired delivery"}: {new Date(x.desired_delivery_at).toLocaleDateString(ar?"ar-PS":"en")}</span>}</div>{x.converted_work_request_id&&<code>{ar?"رقم طلب العمل":"Work request"}: {x.converted_work_request_id}</code>}{x.status==="sent"&&<div className="form-actions">{isTalent&&<><button className="btn" onClick={()=>void act(x.id,"accept")}>{ar?"قبول والانتقال للعرض":"Accept & prepare offer"}</button><button className="btn secondary" onClick={()=>void act(x.id,"decline")}>{ar?"رفض":"Decline"}</button></>}{mine&&<button className="btn secondary" onClick={()=>void act(x.id,"withdraw")}>{ar?"سحب الطلب":"Withdraw"}</button>}</div>}</article>
  }):<div className="empty">{ar?"لا توجد طلبات توظيف مباشر حاليًا.":"No direct hire requests yet."}</div>}</div>
}
