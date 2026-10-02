"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useRef,useState} from "react";
import {draftCopy} from "@/lib/draft-copy";
import {useAIConsent,AIConsentNotice} from "@/components/ai-consent";
import {RoleSelect,ToolsSelect,LanguagesSelect,ContactInput,LocationInput} from "@/components/professional/controls";
import {professionalCopy} from "@/lib/professional-copy";
import type {DraftFields} from "@/domain/profile-draft";

type Draft={draftId:string;text:string;fields:DraftFields;skills:string[];missingFields:string[];warning?:string};
const arrayFields=new Set(["languages","tools","education","experience","services","expertise"]);
const privateFields=new Set(["legalName","phonePrivate","emailPrivate","representativePrivate","contactPrivate"]);
const keys={individual:["displayName","professionalTitle","bio","location","legalName","phonePrivate","emailPrivate","languages","tools","education","experience"],team:["displayName","bio","location","teamSize","services","expertise","history","achievements","representativePrivate","contactPrivate"]} as const;

export function DocumentImport({kind="individual",locale="en"}:{kind?:"individual"|"team";locale?:string}){
 const consent=useAIConsent();
 const c=draftCopy(locale),input=useRef<HTMLInputElement>(null);
 const [busy,setBusy]=useState(false),[fileName,setFileName]=useState(""),[draft,setDraft]=useState<Draft|null>(null),[fields,setFields]=useState<DraftFields>({}),[error,setError]=useState(""),[previous,setPrevious]=useState<DraftFields|null>(null);
 function receive(data:Draft){setDraft(data);setFields(v=>({...v,...Object.fromEntries(Object.entries(data.fields??{}).filter(([,x])=>Array.isArray(x)?x.length:typeof x==="string"?x.trim():x!==undefined))}))}
 async function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!consent.accepted)return;const f=new FormData(e.currentTarget);f.set("consentToExternalAI","on");f.set("kind",kind);f.set("locale",locale);setBusy(true);setError("");
  try{const r=await apiFetch("/api/documents/extract",{method:"POST",body:f});if(!r.ok)throw Error();receive(await r.json())}catch{setError(c.error)}finally{setBusy(false)}
 }
 async function rewrite(mode:"original"|"improved"){
  if(!draft||!consent.accepted)return;setPrevious(fields);setBusy(true);setError("");
  try{const r=await apiFetch("/api/documents/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draftId:draft.draftId,mode,locale,consentToExternalAI:true})});if(!r.ok)throw Error();receive(await r.json())}catch{setError(c.unavailable)}finally{setBusy(false)}
 }
 async function confirm(){
  if(!draft)return;if(kind==="individual"&&(!/^05[0-9]{8}$/.test(String(fields.phonePrivate??""))||!fields.emailPrivate)){setError(professionalCopy(locale).phoneError+" "+professionalCopy(locale).emailRequired);return}setBusy(true);setError("");
  const filled=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,Array.isArray(v)?v.map(s=>s.trim()).filter(Boolean):v] as const).filter(([,v])=>Array.isArray(v)?v.length>0:typeof v==="string"?Boolean(v.trim()):v!==undefined));
  try{const r=await apiFetch("/api/documents/draft",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({draftId:draft.draftId,fields:filled,confirmed:true})});if(!r.ok)throw Error();window.location.reload()}catch{setError(c.error);setBusy(false)}
 }
 return <section className="card grid">
  <form className="grid" onSubmit={upload}><h2>{c.title}</h2><p className="muted">{c.description}</p>
   <label>{c.choose}<input ref={input} name="file" type="file" accept=".pdf,.docx" required disabled={busy} onChange={e=>setFileName(e.target.files?.[0]?.name??"")}/></label>
   <AIConsentNotice locale={locale} consent={consent}/>
   <button className="btn" disabled={busy||!fileName||!consent.accepted}>{busy?c.busy:c.upload}</button>
  </form>
  {error&&<p className="error" role="alert">{error}</p>}
  {draft&&<div className="grid">
   {draft.warning&&<p role="status">{c.unavailable}</p>}
   <details><summary>{c.source}</summary><pre style={{whiteSpace:"pre-wrap",maxHeight:320,overflow:"auto"}}>{draft.text}</pre></details>
   <div className="form-actions"><button type="button" className="btn secondary" disabled={busy} onClick={()=>void rewrite("original")}>{c.original}</button><button type="button" className="btn secondary" disabled={busy} onClick={()=>void rewrite("improved")}>{c.improved}</button></div>
   {draft.missingFields.length>0&&<p>{c.missing}: {draft.missingFields.map(k=>c.fields[k]).join("، ")}</p>}
   <div className="form-grid two">{keys[kind].map(key=><div className="grid" key={key}>{c.fields[key]} {privateFields.has(key)&&<small>({c.private})</small>}
    {key==="professionalTitle"?<RoleSelect locale={locale} value={String(fields[key]??'')} onChange={v=>setFields(x=>({...x,[key]:v}))}/>:key==="tools"?<ToolsSelect locale={locale} title={String(fields.professionalTitle??'')} value={fields.tools??[]} onChange={v=>setFields(x=>({...x,tools:v}))}/>:key==="languages"?<LanguagesSelect locale={locale} value={fields.languages??[]} onChange={v=>setFields(x=>({...x,languages:v}))}/>:key==="phonePrivate"||key==="emailPrivate"?<ContactInput locale={locale} kind={key==='phonePrivate'?'phone':'email'} name={key} value={String(fields[key]??'')} onChange={v=>setFields(x=>({...x,[key]:v}))}/>:key==="location"?<LocationInput locale={locale} value={String(fields.location??'')} onChange={v=>setFields(x=>({...x,location:v}))}/>:key==="teamSize"?<input type="number" min={1} max={1000} disabled={busy} value={fields[key]??""} onChange={e=>setFields(v=>({...v,[key]:e.target.value?Number(e.target.value):undefined}))}/>:<textarea dir="auto" aria-label={c.fields[key]} rows={arrayFields.has(key)?4:2} disabled={busy} value={Array.isArray(fields[key])?(fields[key] as string[]).join("\n"):String(fields[key]??"")} onChange={e=>setFields(v=>({...v,[key]:arrayFields.has(key)?e.target.value.split("\n"):e.target.value}))}/>}
    {arrayFields.has(key)&&<small className="muted">{c.onePerLine}</small>}
   </div>)}</div>
   {previous&&<button type="button" className="btn secondary" disabled={busy} onClick={()=>{setFields(previous);setPrevious(null)}}>{professionalCopy(locale).undo}</button>}
   <p className="muted">{c.review}</p><button type="button" className="btn" disabled={busy} onClick={()=>void confirm()}>{busy?c.busy:c.save}</button>
  </div>}
 </section>;
}
