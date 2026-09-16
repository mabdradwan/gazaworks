"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useRef,useState} from "react";
import {draftCopy} from "@/lib/draft-copy";
import type {DraftFields} from "@/domain/profile-draft";

type Draft={draftId:string;text:string;fields:DraftFields;skills:string[];missingFields:string[];warning?:string};
const arrayFields=new Set(["languages","tools","education","experience","services","expertise"]);
const privateFields=new Set(["legalName","phonePrivate","emailPrivate","representativePrivate","contactPrivate"]);
const keys={individual:["displayName","professionalTitle","bio","location","legalName","phonePrivate","emailPrivate","languages","tools","education","experience"],team:["displayName","bio","location","teamSize","services","expertise","history","achievements","representativePrivate","contactPrivate"]} as const;

export function DocumentImport({kind="individual",locale="en"}:{kind?:"individual"|"team";locale?:string}){
 const c=draftCopy(locale),input=useRef<HTMLInputElement>(null);
 const [busy,setBusy]=useState(false),[fileName,setFileName]=useState(""),[draft,setDraft]=useState<Draft|null>(null),[fields,setFields]=useState<DraftFields>({}),[error,setError]=useState("");
 function receive(data:Draft){setDraft(data);setFields(data.fields??{})}
 async function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const f=new FormData(e.currentTarget);f.set("kind",kind);f.set("locale",locale);setBusy(true);setError("");
  try{const r=await apiFetch("/api/documents/extract",{method:"POST",body:f});if(!r.ok)throw Error();receive(await r.json())}catch{setError(c.error)}finally{setBusy(false)}
 }
 async function rewrite(mode:"original"|"improved"){
  if(!draft)return;setBusy(true);setError("");
  try{const r=await apiFetch("/api/documents/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draftId:draft.draftId,mode,locale})});if(!r.ok)throw Error();receive(await r.json())}catch{setError(c.unavailable)}finally{setBusy(false)}
 }
 async function confirm(){
  if(!draft)return;setBusy(true);setError("");
  const filled=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,Array.isArray(v)?v.map(s=>s.trim()).filter(Boolean):v] as const).filter(([,v])=>Array.isArray(v)?v.length>0:typeof v==="string"?Boolean(v.trim()):v!==undefined));
  try{const r=await apiFetch("/api/documents/draft",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({draftId:draft.draftId,fields:filled,confirmed:true})});if(!r.ok)throw Error();window.location.reload()}catch{setError(c.error);setBusy(false)}
 }
 return <section className="card grid">
  <form className="grid" onSubmit={upload}><h2>{c.title}</h2><p className="muted">{c.description}</p>
   <label>{c.choose}<input ref={input} name="file" type="file" accept=".pdf,.docx" required disabled={busy} onChange={e=>setFileName(e.target.files?.[0]?.name??"")}/></label>
   <button className="btn" disabled={busy||!fileName}>{busy?c.busy:c.upload}</button>
  </form>
  {error&&<p className="error" role="alert">{error}</p>}
  {draft&&<div className="grid">
   {draft.warning&&<p role="status">{c.unavailable}</p>}
   <details><summary>{c.source}</summary><pre style={{whiteSpace:"pre-wrap",maxHeight:320,overflow:"auto"}}>{draft.text}</pre></details>
   <div className="form-actions"><button type="button" className="btn secondary" disabled={busy} onClick={()=>void rewrite("original")}>{c.original}</button><button type="button" className="btn secondary" disabled={busy} onClick={()=>void rewrite("improved")}>{c.improved}</button></div>
   {draft.missingFields.length>0&&<p>{c.missing}: {draft.missingFields.map(k=>c.fields[k]).join("، ")}</p>}
   <div className="form-grid two">{keys[kind].map(key=><label key={key}>{c.fields[key]} {privateFields.has(key)&&<small>({c.private})</small>}
    {key==="teamSize"?<input type="number" min={1} max={1000} disabled={busy} value={fields[key]??""} onChange={e=>setFields(v=>({...v,[key]:e.target.value?Number(e.target.value):undefined}))}/>:<textarea rows={arrayFields.has(key)?4:2} disabled={busy} value={Array.isArray(fields[key])?(fields[key] as string[]).join("\n"):String(fields[key]??"")} onChange={e=>setFields(v=>({...v,[key]:arrayFields.has(key)?e.target.value.split("\n"):e.target.value}))}/>}
    {arrayFields.has(key)&&<small className="muted">{c.onePerLine}</small>}
   </label>)}</div>
   {draft.skills.length>0&&<p>{c.skills}: {draft.skills.join("، ")}</p>}
   <p className="muted">{c.review}</p><button type="button" className="btn" disabled={busy} onClick={()=>void confirm()}>{busy?c.busy:c.save}</button>
  </div>}
 </section>;
}
