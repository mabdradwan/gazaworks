"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Profile={id:string;account_type:"individual"|"team"|"client"};
type Agreement={scope:string;price_minor:number;currency:string};
type Project={payment_simulated?:boolean;payment_secured?:boolean;simulator_enabled?:boolean;id:string;status:string;deadline?:string|null;created_at:string;client_id:string;talent_id:string;work_request_id?:string|null;project_agreements?:Agreement|Agreement[]|null;profiles?:{display_name?:string}|null;talent?:{display_name?:string}|null};
type Delivery={id:string;message:string;submitted_at:string;auto_accept_at:string;accepted_at?:string|null;revision_requested_at?:string|null};
type ProjectFile={id:string;uploader_id:string;delivery_id?:string|null;mime_type:string;size_bytes:number;created_at:string;url?:string|null};

function agreementOf(p:Project){return Array.isArray(p.project_agreements)?p.project_agreements[0]:p.project_agreements}
function statusLabel(s:string,ar:boolean){const m:Record<string,string>={offer_accepted:"تم قبول العرض",awaiting_payment:"بانتظار الدفع",funded:"تم تأمين الدفع",in_progress:"قيد التنفيذ",submitted:"تم التسليم",client_review:"مراجعة العميل",completed:"مكتمل",disputed:"نزاع",appeal:"استئناف",cancelled:"ملغي",refunded:"مسترد",payout_pending:"بانتظار التحويل",paid:"تم الدفع"};return ar?(m[s]??s):s.replaceAll("_"," ")}

export function ProjectsPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[me,setMe]=useState<Profile|null>(null),[items,setItems]=useState<Project[]>([]),[message,setMessage]=useState("");
  async function load(){const [p,r]=await Promise.all([apiFetch("/api/profile"),apiFetch("/api/projects")]);if(p.ok)setMe(await p.json());if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function fund(id:string){if(!confirm(ar?"هذا محاكي تطوير فقط وليس دفعة حقيقية. متابعة؟":"This is a development simulator, not a real payment. Continue?"))return;const r=await apiFetch("/api/payments/mock-fund",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,providerFeeMinor:0})});const d=await r.json().catch(()=>({}));setMessage(r.ok?(ar?"تمت محاكاة التمويل للتطوير فقط. لا توجد عملية مالية حقيقية.":"Development payment simulated. No real charge occurred."):(d.error??(ar?"تعذّرت المحاكاة.":"Could not simulate funding.")));if(r.ok)await load()}
  async function review(id:string,action:"accept"|"request_revision"){const r=await apiFetch("/api/projects/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,action})});setMessage(r.ok?(action==="accept"?(ar?"تم قبول التسليم وأصبح الاستحقاق بانتظار التحويل.":"Delivery accepted; payout is pending."):(ar?"تم طلب مراجعة ضمن نطاق المشروع.":"Revision requested.")):(ar?"تعذّر تنفيذ الإجراء.":"Action unavailable."));if(r.ok)await load()}
  return <div className="grid">{message&&<p role="status">{message}</p>}{items.length?items.map(p=><ProjectCard key={p.id} p={p} me={me} locale={locale} onFund={fund} onReview={review} reload={load}/>):<div className="empty">{ar?"لا توجد مشاريع بعد.":"No projects yet."}</div>}</div>
}

function ProjectCard({p,me,locale,onFund,onReview,reload}:{p:Project;me:Profile|null;locale:string;onFund:(id:string)=>Promise<void>;onReview:(id:string,a:"accept"|"request_revision")=>Promise<void>;reload:()=>Promise<void>}){
  const ar=locale==="ar",agreement=agreementOf(p),isClient=me?.id===p.client_id,isTalent=me?.id===p.talent_id;
  const [expanded,setExpanded]=useState(false),[deliveries,setDeliveries]=useState<Delivery[]>([]),[files,setFiles]=useState<ProjectFile[]>([]),[notice,setNotice]=useState(""),fileRef=useRef<HTMLInputElement>(null),[deliveryFile,setDeliveryFile]=useState<File|null>(null);
  async function details(){const [d,f]=await Promise.all([apiFetch("/api/projects/deliveries?projectId="+p.id),apiFetch("/api/projects/files?projectId="+p.id)]);if(d.ok)setDeliveries(await d.json());if(f.ok)setFiles(await f.json())}
  useEffect(()=>{if(expanded)void details()},[expanded]);

  async function upload(file:File){
    const prep=await apiFetch("/api/projects/files",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,fileName:file.name,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});const x=await prep.json();if(!prep.ok)throw Error(x.error??"upload_prepare_failed");
    const db=supabaseBrowser();const {error}=await db.storage.from("project-files").uploadToSignedUrl(x.path,x.token,file,{contentType:file.type||"application/octet-stream"});if(error)throw error;
    const done=await apiFetch("/api/projects/files",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,path:x.path,mimeType:file.type||"application/octet-stream",sizeBytes:file.size,deliveryId:null})});if(!done.ok)throw Error("file_record_failed");return String((await done.json()).id);
  }
  async function addFile(file:File){setNotice(ar?"جارٍ رفع الملف…":"Uploading file…");try{await upload(file);setNotice(ar?"تم رفع ملف المشروع.":"Project file uploaded.");await details()}catch{setNotice(ar?"تعذّر رفع الملف.":"File upload failed.")}}
  const [submitting,setSubmitting]=useState(false);
  async function deliver(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const formEl=e.currentTarget,f=new FormData(formEl);setSubmitting(true);setNotice("");
    try{
      const fileIds=deliveryFile?[await upload(deliveryFile)]:[];
      const r=await apiFetch("/api/projects/deliveries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:p.id,message:f.get("message"),fileIds})});
      if(!r.ok)throw Error("delivery_failed");
      setDeliveryFile(null);formEl.reset();setNotice(ar?"تم إرسال التسليم النهائي ومرفقاته. لدى العميل 3 أيام للمراجعة.":"Final delivery and attachments submitted. The client has 3 days to review.");await details();await reload();
    }catch{setNotice(ar?"تعذّر تأكيد التسليم. راجع سجل التسليم قبل إعادة المحاولة.":"Could not confirm delivery. Check delivery history before retrying.")}
    finally{setSubmitting(false)}
  }


  const party=isClient?(p.talent?.display_name??(ar?"المحترف":"Talent")):(p.profiles?.display_name??(ar?"العميل":"Client"));
  return <article className="card project-card">
    <div className="card-head"><div><span className={"badge project-status status-"+p.status}>{p.payment_simulated&&p.status==="funded"?(ar?"تمويل تجريبي":"Simulated funding"):statusLabel(p.status,ar)}</span><h2>{ar?"مشروع مع":"Project with"} {party}</h2></div>{agreement&&<strong>{new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:agreement.currency}).format(agreement.price_minor/100)}</strong>}</div>
    {agreement&&<><h4>{ar?"النطاق المتفق عليه":"Agreed scope"}</h4><p>{agreement.scope}</p></>}
    <div className="meta-grid"><span>{ar?"تاريخ الإنشاء":"Created"}: {new Date(p.created_at).toLocaleDateString(ar?"ar-PS":"en")}</span>{p.deadline&&<span>{ar?"الموعد النهائي":"Deadline"}: {new Date(p.deadline).toLocaleDateString(ar?"ar-PS":"en")}</span>}<span>{ar?"الطرف الآخر":"Counterparty"}: {party}</span></div>
    {p.status==="funded"&&isTalent&&p.payment_secured&&<div className="secure-payment-banner">✓ {ar?"تم تأمين الدفع عبر GazaWorks — يمكنك بدء العمل":"Payment secured by GazaWorks — you may begin work"}</div>}
    {p.payment_simulated&&<div className="development-warning">{ar?"تمويل تجريبي فقط — لم يتم استلام أو تأمين أي أموال.":"Development funding only — no money was received or secured."}</div>}
    {p.status==="awaiting_payment"&&isClient&&<div className="card development-warning"><strong>{ar?"وضع التطوير":"Development mode"}</strong><p>{ar?"بوابة الدفع الحقيقية غير مفعلة قبل الموافقات البنكية والقانونية. المحاكي أدناه لا يجري أي خصم حقيقي.":"A real payment gateway is not enabled before banking/legal approval. The simulator below never charges real money."}</p>{p.simulator_enabled&&<button className="btn" onClick={()=>void onFund(p.id)}>{ar?"محاكاة التمويل للتطوير":"Simulate funding (development only)"}</button>}</div>}
    {p.status==="client_review"&&isClient&&<div className="form-actions"><button className="btn" onClick={()=>void onReview(p.id,"accept")}>{ar?"قبول التسليم":"Accept delivery"}</button><button className="btn secondary" onClick={()=>void onReview(p.id,"request_revision")}>{ar?"طلب مراجعة ضمن النطاق":"Request revision"}</button></div>}
    <button className="btn secondary" onClick={()=>setExpanded(v=>!v)}>{expanded?(ar?"إخفاء التفاصيل":"Hide details"):(ar?"الملفات والتسليمات":"Files & deliveries")}</button>
    {expanded&&<div className="grid project-details">
      <div className="card"><h3>{ar?"ملفات المشروع":"Project files"}</h3><input ref={fileRef} type="file" onChange={e=>{const f=e.target.files?.[0];if(f)void addFile(f)}}/>{files.length?<div className="document-list">{files.map(f=><a className="document-row" key={f.id} href={f.url??"#"} target={f.url?"_blank":undefined} rel="noreferrer"><span>{f.mime_type}</span><small>{(f.size_bytes/1024/1024).toFixed(1)} MB · {new Date(f.created_at).toLocaleString(ar?"ar-PS":"en")}</small></a>)}</div>:<div className="empty">{ar?"لا توجد ملفات بعد.":"No files yet."}</div>}</div>
      <div className="card"><h3>{ar?"سجل التسليم":"Delivery history"}</h3>{deliveries.length?deliveries.map(d=><div className="delivery-row" key={d.id}><p>{d.message}</p><small className="muted">{new Date(d.submitted_at).toLocaleString(ar?"ar-PS":"en")} · {d.accepted_at?(ar?"مقبول":"accepted"):d.revision_requested_at?(ar?"طُلبت مراجعة":"revision requested"):(ar?"بانتظار مراجعة العميل":"awaiting review")}</small>{!d.accepted_at&&!d.revision_requested_at&&<small>{ar?"القبول التلقائي":"Auto-accept"}: {new Date(d.auto_accept_at).toLocaleString(ar?"ar-PS":"en")}</small>}</div>):<div className="empty">{ar?"لم يتم تقديم تسليم بعد.":"No delivery submitted yet."}</div>}</div>
      {isTalent&&["funded","in_progress"].includes(p.status)&&<form className="card grid" onSubmit={deliver}><h3>{ar?"إرسال التسليم النهائي":"Submit final delivery"}</h3><label>{ar?"رسالة التسليم":"Delivery message"}<textarea name="message" minLength={3} rows={5} required/></label><label>{ar?"ملف التسليم (اختياري)":"Delivery file (optional)"}<input type="file" onChange={e=>setDeliveryFile(e.target.files?.[0]??null)}/></label><button className="btn" disabled={submitting}>{ar?"إرسال للمراجعة":"Submit for client review"}</button></form>}
      {notice&&<p role="status">{notice}</p>}
    </div>}
  </article>
}

