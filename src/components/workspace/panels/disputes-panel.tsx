"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Project={id:string;status:string;profiles?:{display_name?:string}|null;talent?:{display_name?:string}|null};
type Appeal={id:string;status:string;reasoning:string;final_decision?:string|null;created_at:string};
type Dispute={id:string;project_id:string;reason:string;status:string;decision?:string|null;reasoning?:string|null;decided_at?:string|null;created_at:string;appeals?:Appeal[]};
type Evidence={id:string;statement?:string|null;storage_path?:string|null;url?:string|null;created_at:string};

export function DisputesPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[items,setItems]=useState<Dispute[]>([]),[projects,setProjects]=useState<Project[]>([]),[message,setMessage]=useState("");
  async function load(){const [d,p]=await Promise.all([apiFetch("/api/disputes"),apiFetch("/api/projects")]);if(d.ok)setItems(await d.json());if(p.ok)setProjects(await p.json())}
  useEffect(()=>{void load()},[]);
  async function open(e:FormEvent<HTMLFormElement>){e.preventDefault();const formEl=e.currentTarget,f=new FormData(formEl);const r=await apiFetch("/api/disputes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:f.get("projectId"),reason:f.get("reason")})});setMessage(r.ok?(ar?"تم فتح النزاع وتجميد التحويل والقبول التلقائي.":"Dispute opened; payout and automatic acceptance are frozen."):(ar?"تعذّر فتح النزاع.":"Could not open dispute."));if(r.ok){formEl.reset();await load()}}
  return <div className="grid">
    <form className="card grid" onSubmit={open}><div><h2>{ar?"فتح نزاع":"Open a dispute"}</h2><p className="muted">{ar?"استخدم النزاع فقط عند وجود مشكلة حقيقية في نطاق العمل أو التسليم. تحتفظ GazaWorks بالمحادثات والملفات والاتفاقية كأدلة.":"Use disputes only for genuine scope/delivery problems. GazaWorks preserves chat, files, agreement and delivery history as evidence."}</p></div><label>{ar?"المشروع":"Project"}<select name="projectId" required><option value="">{ar?"اختر مشروعًا":"Choose project"}</option>{projects.filter(p=>!["paid","refunded","cancelled"].includes(p.status)).map(p=><option key={p.id} value={p.id}>{p.talent?.display_name??p.profiles?.display_name??p.id} · {p.status}</option>)}</select></label><label>{ar?"سبب النزاع":"Reason"}<textarea name="reason" minLength={10} rows={6} required/></label><button className="btn">{ar?"فتح النزاع":"Open dispute"}</button><p role="status">{message}</p></form>
    {items.length?items.map(x=><DisputeCard key={x.id} dispute={x} locale={locale} reload={load}/>):<div className="empty">{ar?"لا توجد نزاعات.":"No disputes."}</div>}
  </div>
}

function DisputeCard({dispute,locale,reload}:{dispute:Dispute;locale:string;reload:()=>Promise<void>}){
  const ar=locale==="ar",[evidence,setEvidence]=useState<Evidence[]>([]),[notice,setNotice]=useState("");
  async function loadEvidence(){const r=await apiFetch("/api/disputes/evidence?disputeId="+dispute.id);if(r.ok)setEvidence(await r.json())}
  useEffect(()=>{void loadEvidence()},[dispute.id]);
  async function submitEvidence(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,f=new FormData(form),file=(form.elements.namedItem("file") as HTMLInputElement)?.files?.[0];let storagePath:string|undefined;
    try{
      if(file){const prep=await apiFetch("/api/disputes/evidence/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({disputeId:dispute.id,fileName:file.name,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});const p=await prep.json();if(!prep.ok)throw Error(p.error);const db=supabaseBrowser();const {error}=await db.storage.from("dispute-evidence").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type||"application/octet-stream"});if(error)throw error;storagePath=p.path}
      const r=await apiFetch("/api/disputes/evidence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({disputeId:dispute.id,statement:f.get("statement"),storagePath})});setNotice(r.ok?(ar?"تمت إضافة الدليل.":"Evidence added."):(ar?"تعذّر إضافة الدليل.":"Could not add evidence."));if(r.ok){form.reset();await loadEvidence()}
    }catch{setNotice(ar?"تعذّر رفع ملف الدليل.":"Evidence upload failed.")}
  }
  async function appeal(e:FormEvent<HTMLFormElement>){e.preventDefault();const formEl=e.currentTarget,f=new FormData(formEl);const r=await apiFetch("/api/appeals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({disputeId:dispute.id,reasoning:f.get("reasoning")})});setNotice(r.ok?(ar?"تم إرسال الاستئناف الوحيد للمراجعة.":"Single appeal submitted for review."):(ar?"الاستئناف غير متاح أو انتهت نافذة 12 ساعة أو تم استخدامه سابقًا.":"Appeal unavailable, already used, or outside the 12-hour window."));if(r.ok)await reload()}
  const canAppeal=Boolean(dispute.decided_at)&&!(dispute.appeals?.length);
  return <article className="card grid dispute-card"><div className="card-head"><div><span className="badge">{dispute.status}</span><h2>{ar?"نزاع المشروع":"Project dispute"}</h2></div><small>{new Date(dispute.created_at).toLocaleDateString(ar?"ar-PS":"en")}</small></div><p><strong>{ar?"السبب":"Reason"}:</strong> {dispute.reason}</p>{dispute.decision&&<div className="decision-box"><strong>{ar?"قرار الإدارة":"Administration decision"}: {dispute.decision}</strong><p>{dispute.reasoning}</p>{dispute.decided_at&&<small>{new Date(dispute.decided_at).toLocaleString(ar?"ar-PS":"en")}</small>}</div>}
    <div className="grid"><h3>{ar?"الأدلة":"Evidence"}</h3>{evidence.length?evidence.map(e=><div className="document-row" key={e.id}><div><p>{e.statement}</p><small>{new Date(e.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div>{e.url&&<a className="btn secondary" href={e.url} target="_blank" rel="noreferrer">{ar?"فتح الملف":"Open file"}</a>}</div>):<div className="empty">{ar?"لا توجد أدلة مضافة بعد.":"No evidence added yet."}</div>}
      {["open","under_review"].includes(dispute.status)&&<form className="card grid" onSubmit={submitEvidence}><label>{ar?"بيان أو شرح":"Statement"}<textarea name="statement" minLength={3} rows={4} required/></label><label>{ar?"ملف داعم (اختياري)":"Supporting file (optional)"}<input name="file" type="file"/></label><button className="btn secondary">{ar?"إضافة دليل":"Add evidence"}</button></form>}
    </div>
    {canAppeal&&<form className="card grid" onSubmit={appeal}><h3>{ar?"استئناف واحد خلال 12 ساعة":"One appeal within 12 hours"}</h3><label>{ar?"أدلة جديدة أو سبب واضح":"New evidence or clear reasoning"}<textarea name="reasoning" minLength={10} rows={5} required/></label><button className="btn">{ar?"إرسال الاستئناف":"Submit appeal"}</button></form>}
    {dispute.appeals?.map(a=><div className="card" key={a.id}><span className="badge">{a.status}</span><h3>{ar?"الاستئناف":"Appeal"}</h3><p>{a.reasoning}</p>{a.final_decision&&<p><strong>{ar?"القرار النهائي":"Final decision"}:</strong> {a.final_decision}</p>}</div>)}
    {notice&&<p role="status">{notice}</p>}
  </article>
}

