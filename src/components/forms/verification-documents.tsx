"use client";
import {useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Doc={id:string;label?:string|null;mime_type:string;created_at:string;url?:string|null};

export function VerificationDocuments({locale="en"}:{locale?:string}){
  const ar=locale==="ar",input=useRef<HTMLInputElement>(null);
  const [items,setItems]=useState<Doc[]>([]),[label,setLabel]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/verification/documents");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function upload(file:File){
    setBusy(true);setMessage(ar?"جارٍ رفع المستند…":"Uploading document…");
    const prep=await fetch("/api/verification/documents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})});
    const p=await prep.json();if(!prep.ok){setMessage(ar?"تعذّر رفع الملف. استخدم PDF أو صورة بحجم أقل من 20MB.":p.error??"Upload rejected.");setBusy(false);return}
    const db=supabaseBrowser();const {error}=await db.storage.from("verification-documents").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
    if(error){setMessage(error.message);setBusy(false);return}
    const save=await fetch("/api/verification/documents",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:p.path,mimeType:file.type,label:label||file.name})});
    setMessage(save.ok?(ar?"تم حفظ مستند التحقق.":"Verification document saved."):(ar?"تعذّر تسجيل المستند.":"Could not record document."));
    if(save.ok){setLabel("");await load()}setBusy(false);
  }
  async function remove(id:string){if(!confirm(ar?"حذف هذا المستند؟":"Delete this document?"))return;await fetch("/api/verification/documents?id="+encodeURIComponent(id),{method:"DELETE"});await load()}
  return <div className="card grid">
    <div><h2>{ar?"مستندات التحقق":"Verification documents"}</h2><p className="muted">{ar?"هذه الملفات خاصة ولا يراها إلا أنت وفريق التحقق المخوّل.":"These files stay private to you and authorized verification staff."}</p></div>
    <div className="form-grid two"><label>{ar?"اسم المستند":"Document label"}<input value={label} onChange={e=>setLabel(e.target.value)} placeholder={ar?"مثال: هوية أو شهادة":"e.g. ID or certificate"}/></label><div style={{alignSelf:"end"}}><input ref={input} className="sr-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/><button type="button" className="btn" disabled={busy} onClick={()=>input.current?.click()}>{busy?(ar?"جارٍ الرفع…":"Uploading…"):(ar?"رفع مستند":"Upload document")}</button></div></div>
    {message&&<p role="status">{message}</p>}
    {items.length?<div className="document-list">{items.map(d=><div className="document-row" key={d.id}><div><strong>{d.label||d.mime_type}</strong><small className="muted">{new Date(d.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div><div className="form-actions">{d.url&&<a className="btn secondary" href={d.url} target="_blank" rel="noreferrer">{ar?"عرض":"View"}</a>}<button type="button" className="btn secondary" onClick={()=>void remove(d.id)}>{ar?"حذف":"Delete"}</button></div></div>)}</div>:<div className="empty">{ar?"لم ترفع مستندات تحقق بعد.":"No verification documents uploaded yet."}</div>}
  </div>
}
