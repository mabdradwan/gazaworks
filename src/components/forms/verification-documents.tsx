"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useCallback,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {verificationDocumentCopy} from "@/lib/appointment-copy";

type Doc={id:string;label?:string|null;mime_type:string;created_at:string;url?:string|null;canDelete:boolean};
export function VerificationDocuments({locale="en"}:{locale?:string}){
 const c=verificationDocumentCopy(locale),input=useRef<HTMLInputElement>(null);
 const [items,setItems]=useState<Doc[]>([]),[label,setLabel]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const load=useCallback(async()=>{const r=await apiFetch("/api/verification/documents");if(r.ok)setItems(await r.json());else setMessage(verificationDocumentCopy(locale).loadFailed);},[locale]);
 useEffect(()=>{void load();},[load]);
 async function upload(file:File){
  setBusy(true);setMessage(c.uploading);
  try{
   if(file.size>20_971_520||!["application/pdf","image/jpeg","image/png","image/webp"].includes(file.type)){setMessage(c.uploadFailed);return;}
   const prep=await apiFetch("/api/verification/documents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})}),p=await prep.json();
   if(!prep.ok){setMessage(c.uploadFailed);return;}
   const {error}=await supabaseBrowser().storage.from("verification-documents").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
   if(error){setMessage(c.uploadFailed);return;}
   const save=await apiFetch("/api/verification/documents",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:p.path,mimeType:file.type,label:label||file.name.slice(0,120)})});
   setMessage(save.ok?c.saved:c.recordFailed);
   if(save.ok){setLabel("");await load();}
  }catch{setMessage(c.uploadFailed);}
  finally{setBusy(false);if(input.current)input.current.value="";}
 }
 async function remove(id:string){
  if(!window.confirm(c.confirm))return;
  setBusy(true);
  try{const response=await apiFetch("/api/verification/documents?id="+encodeURIComponent(id),{method:"DELETE"}),data=await response.json();setMessage(response.ok?"":data.error==="verification_evidence_preserved"?c.retained:c.deleteFailed);await load();}
  finally{setBusy(false);}
 }
 return <div className="card grid">
  <div><h2>{c.title}</h2><p className="muted">{c.privacy}</p></div>
  <div className="form-grid two"><label>{c.label}<input maxLength={120} disabled={busy} value={label} onChange={e=>setLabel(e.target.value)} placeholder={c.example}/></label><div style={{alignSelf:"end"}}><input ref={input} aria-label={c.upload} disabled={busy} className="sr-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);}}/><button type="button" className="btn" disabled={busy} onClick={()=>input.current?.click()}>{busy?c.uploading:c.upload}</button></div></div>
  {message&&<p role="status">{message}</p>}
  {items.some(d=>!d.canDelete)&&<p className="muted">{c.retained}</p>}
  {items.length?<div className="document-list">{items.map(d=><div className="document-row" key={d.id}><div><strong>{d.label||d.mime_type}</strong><small className="muted">{new Date(d.created_at).toLocaleString(locale)}</small></div><div className="form-actions">{d.url&&<a className="btn secondary" href={d.url} target="_blank" rel="noreferrer">{c.view}</a>}{d.canDelete&&<button type="button" className="btn secondary" disabled={busy} onClick={()=>void remove(d.id)}>{c.remove}</button>}</div></div>)}</div>:<div className="empty">{c.empty}</div>}
 </div>;
}
