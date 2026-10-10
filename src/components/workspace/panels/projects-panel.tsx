"use client";
import {latinLocale} from "@/lib/formatting";

import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {projectPanelCopy} from "@/lib/project-panel-copy";
import {messagesPanelCopy} from "@/lib/messages-panel-copy";

type Profile={id:string;account_type:"individual"|"team"|"client"};
type Agreement={scope:string;price_minor:number;currency:string};
type Project={payment_simulated?:boolean;payment_secured?:boolean;simulator_enabled?:boolean;id:string;status:string;deadline?:string|null;created_at:string;client_id:string;talent_id:string;work_request_id?:string|null;project_agreements?:Agreement|Agreement[]|null;profiles?:{display_name?:string}|null;talent?:{display_name?:string}|null};
type Delivery={id:string;message:string;submitted_at:string;auto_accept_at:string;accepted_at?:string|null;revision_requested_at?:string|null};
type ProjectFile={id:string;uploader_id:string;delivery_id?:string|null;mime_type:string;size_bytes:number;created_at:string;url?:string|null};

function agreementOf(p:Project){return Array.isArray(p.project_agreements)?p.project_agreements[0]:p.project_agreements}

export function ProjectsPanel({locale="en"}:{locale?:string}){
  const c=projectPanelCopy(locale),[me,setMe]=useState<Profile|null>(null),[items,setItems]=useState<Project[]>([]),[message,setMessage]=useState("");
  const load=useCallback(async()=>{const [p,r]=await Promise.all([apiFetch("/api/profile"),apiFetch("/api/projects")]);if(p.ok)setMe(await p.json());if(r.ok)setItems(await r.json())},[]);
  useEffect(()=>{void load()},[load]);
  async function fund(id:string){if(!confirm(c.simulatorConfirm))return;const r=await apiFetch("/api/payments/mock-fund",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,providerFeeMinor:0})});setMessage(r.ok?c.simulated:c.simulateFailed);if(r.ok)await load()}
  async function review(id:string,action:"accept"|"request_revision"){const r=await apiFetch("/api/projects/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,action})});setMessage(r.ok?(action==="accept"?c.accepted:c.revisionRequested):c.reviewFailed);if(r.ok)await load()}
  return <div className="grid">{message&&<p role="status">{message}</p>}{items.length?items.map(p=><ProjectCard key={p.id} p={p} me={me} locale={locale} onFund={fund} onReview={review} reload={load}/>):<div className="empty">{c.empty}</div>}</div>
}

function ProjectCard({p,me,locale,onFund,onReview,reload}:{p:Project;me:Profile|null;locale:string;onFund:(id:string)=>Promise<void>;onReview:(id:string,a:"accept"|"request_revision")=>Promise<void>;reload:()=>Promise<void>}){
  const c=projectPanelCopy(locale),states=messagesPanelCopy(locale).projectStates,agreement=agreementOf(p),isClient=me?.id===p.client_id,isTalent=me?.id===p.talent_id;
  const [expanded,setExpanded]=useState(false),[deliveries,setDeliveries]=useState<Delivery[]>([]),[files,setFiles]=useState<ProjectFile[]>([]),[notice,setNotice]=useState(""),fileRef=useRef<HTMLInputElement>(null),[deliveryFile,setDeliveryFile]=useState<File|null>(null);
  const details=useCallback(async()=>{const [d,f]=await Promise.all([apiFetch("/api/projects/deliveries?projectId="+p.id),apiFetch("/api/projects/files?projectId="+p.id)]);if(d.ok)setDeliveries(await d.json());if(f.ok)setFiles(await f.json())},[p.id]);
  useEffect(()=>{if(expanded)void details()},[expanded,details]);

  async function upload(file:File){
    const prep=await apiFetch("/api/projects/files",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,fileName:file.name,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});const x=await prep.json();if(!prep.ok)throw Error(x.error??"upload_prepare_failed");
    const db=supabaseBrowser();const {error}=await db.storage.from("project-files").uploadToSignedUrl(x.path,x.token,file,{contentType:file.type||"application/octet-stream"});if(error)throw error;
    const done=await apiFetch("/api/projects/files",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,path:x.path,mimeType:file.type||"application/octet-stream",sizeBytes:file.size,deliveryId:null})});if(!done.ok)throw Error("file_record_failed");return String((await done.json()).id);
  }
  async function addFile(file:File){setNotice(c.uploading);try{await upload(file);setNotice(c.uploaded);await details()}catch{setNotice(c.uploadFailed)}}
  const [submitting,setSubmitting]=useState(false);
  async function deliver(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const formEl=e.currentTarget,f=new FormData(formEl);setSubmitting(true);setNotice("");
    try{
      const fileIds=deliveryFile?[await upload(deliveryFile)]:[];
      const r=await apiFetch("/api/projects/deliveries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,message:f.get("message"),fileIds})});
      if(!r.ok)throw Error("delivery_failed");
      setDeliveryFile(null);formEl.reset();setNotice(c.deliverySubmitted);await details();await reload();
    }catch{setNotice(c.deliveryFailed)}
    finally{setSubmitting(false)}
  }


  const party=isClient?(p.talent?.display_name??c.talent):(p.profiles?.display_name??c.client);
  return <article className="card project-card">
    <div className="card-head"><div><span className={"badge project-status status-"+p.status}>{p.payment_simulated&&p.status==="funded"?c.simulatedFunding:(states[p.status]??p.status.replaceAll("_"," "))}</span><h2>{c.projectWith} {party}</h2></div>{agreement&&<strong>{new Intl.NumberFormat(latinLocale(c.localeTag),{style:"currency",currency:agreement.currency}).format(agreement.price_minor/100)}</strong>}</div>
    {agreement&&<><h4>{c.agreedScope}</h4><p>{agreement.scope}</p></>}
    <div className="meta-grid"><span>{c.created}: {new Date(p.created_at).toLocaleDateString(latinLocale(c.localeTag))}</span>{p.deadline&&<span>{c.deadline}: {new Date(p.deadline).toLocaleDateString(latinLocale(c.localeTag))}</span>}<span>{c.counterparty}: {party}</span></div>
    {p.status==="funded"&&isTalent&&p.payment_secured&&!p.payment_simulated&&<div className="secure-payment-banner">✓ {c.paymentSecured}</div>}
    {p.payment_simulated&&<div className="development-warning">{c.simulationWarning}</div>}
    {p.status==="awaiting_payment"&&isClient&&<div className="card development-warning"><strong>{c.developmentMode}</strong><p>{c.gatewayUnavailable}</p>{p.simulator_enabled&&<button className="btn" onClick={()=>void onFund(p.id)}>{c.simulateFunding}</button>}</div>}
    {p.status==="client_review"&&isClient&&<div className="form-actions"><button className="btn" onClick={()=>void onReview(p.id,"accept")}>{c.acceptDelivery}</button><button className="btn secondary" onClick={()=>void onReview(p.id,"request_revision")}>{c.requestRevision}</button></div>}
    <button className="btn secondary" onClick={()=>setExpanded(v=>!v)}>{expanded?c.hideDetails:c.filesAndDeliveries}</button>
    {expanded&&<div className="grid project-details">
      <div className="card"><h3>{c.projectFiles}</h3><input ref={fileRef} type="file" aria-label={c.projectFiles} onChange={e=>{const f=e.target.files?.[0];if(f)void addFile(f)}}/>{files.length?<div className="document-list">{files.map(f=><a className="document-row" key={f.id} href={f.url??"#"} target={f.url?"_blank":undefined} rel="noreferrer"><span>{f.mime_type}</span><small>{(f.size_bytes/1024/1024).toFixed(1)} MB · {new Date(f.created_at).toLocaleString(latinLocale(c.localeTag))}</small></a>)}</div>:<div className="empty">{c.noFiles}</div>}</div>
      <div className="card"><h3>{c.deliveryHistory}</h3>{deliveries.length?deliveries.map(d=><div className="delivery-row" key={d.id}><p>{d.message}</p><small className="muted">{new Date(d.submitted_at).toLocaleString(latinLocale(c.localeTag))} · {d.accepted_at?c.deliveryAccepted:d.revision_requested_at?c.revisionStatus:c.awaitingReview}</small>{!d.accepted_at&&!d.revision_requested_at&&<small>{c.autoAccept}: {new Date(d.auto_accept_at).toLocaleString(latinLocale(c.localeTag))}</small>}</div>):<div className="empty">{c.noDelivery}</div>}</div>
      {isTalent&&["funded","in_progress"].includes(p.status)&&<form className="card grid" onSubmit={deliver}><h3>{c.submitFinalDelivery}</h3><label>{c.deliveryMessage}<textarea name="message" minLength={3} rows={5} required/></label><label>{c.deliveryFile}<input type="file" onChange={e=>setDeliveryFile(e.target.files?.[0]??null)}/></label><button className="btn" disabled={submitting}>{c.submitForReview}</button></form>}
      {notice&&<p role="status">{notice}</p>}
    </div>}
  </article>
}
