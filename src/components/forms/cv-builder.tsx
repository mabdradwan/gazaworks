"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
import {cvFieldKeys,emptyCV,type CV} from "@/domain/cv";
import {cvCopy} from "@/lib/cv-copy";
import {locales,isLocale,type Locale} from "@/lib/i18n";

export function CVBuilder({locale="en"}:{locale?:string}){
 const c=cvCopy(locale);
 const [cv,setCv]=useState<CV>(emptyCV),[step,setStep]=useState(0),[template,setTemplate]=useState<"classic"|"modern">("classic"),[language,setLanguage]=useState<Locale>(isLocale(locale)?locale:"en"),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(false),[suggestion,setSuggestion]=useState<CV|null>(null),[message,setMessage]=useState("");
 const labels=cvCopy(language),key=cvFieldKeys[step];
 useEffect(()=>{
  let active=true;
  void apiFetch("/api/cv").then(async r=>{if(!r.ok)throw Error();const d=await r.json();if(active&&d){setCv(d.cv);setTemplate(d.template);setLanguage(d.locale)}}).catch(()=>{if(active)setLoadError(true)}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);
 async function save(){
  setBusy(true);setMessage("");
  try{const r=await apiFetch("/api/cv",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({cv,locale:language,template,confirmed:true})});if(!r.ok)throw Error();setMessage(c.saved)}catch{setMessage(c.error)}finally{setBusy(false)}
 }
 async function improve(){
  setBusy(true);setMessage("");
  try{const r=await apiFetch("/api/cv",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cv,locale:language,template})});if(!r.ok)throw Error();const d=await r.json();setSuggestion(d.cv)}catch{setMessage(c.unavailable)}finally{setBusy(false)}
 }
 if(loading)return <p role="status">{c.busy}</p>;
 if(loadError)return <p role="alert">{c.loadError}</p>;
 return <div className="cv-builder-layout">
  <div className="grid no-print">
   <section className="card grid"><div className="card-head"><h2>{c.title}</h2><span className="badge">{step+1}/{cvFieldKeys.length}</span></div><p className="muted">{c.intro}</p>
    <label>{c.fields[key]}<textarea rows={6} maxLength={key==="name"?160:key==="title"?200:6000} value={cv[key]} disabled={busy} onChange={e=>setCv(v=>({...v,[key]:e.target.value}))}/></label>
    <div className="form-actions"><button type="button" className="btn secondary" disabled={step===0} onClick={()=>setStep(s=>s-1)}>{c.previous}</button><button type="button" className="btn" disabled={step===cvFieldKeys.length-1} onClick={()=>setStep(s=>s+1)}>{c.next}</button></div>
   </section>
   <section className="card grid"><div className="form-grid two">
    <label>{c.template}<select value={template} onChange={e=>setTemplate(e.target.value as "classic"|"modern")}><option value="classic">{c.classic}</option><option value="modern">{c.modern}</option></select></label>
    <label>{c.language}<select value={language} disabled={busy} onChange={e=>{if(isLocale(e.target.value)){setLanguage(e.target.value);setSuggestion(null)}}}>{locales.map(l=><option value={l} key={l}>{({ar:"العربية",en:"English",tr:"Türkçe",es:"Español",fr:"Français",de:"Deutsch"})[l]}</option>)}</select></label>
   </div><div className="form-actions"><button type="button" className="btn" disabled={busy||!cv.name.trim()||!cv.title.trim()} onClick={()=>void improve()}>{busy?c.busy:c.improve}</button><button type="button" className="btn secondary" disabled={busy} onClick={()=>void save()}>{c.save}</button><button type="button" className="btn secondary" onClick={()=>window.print()}>{c.print}</button></div><p className="muted">{c.printHint}</p>{message&&<p role="status">{message}</p>}</section>
   {suggestion&&<section className="card grid"><p>{c.review}</p><div dir={language==="ar"?"rtl":"ltr"}>{cvFieldKeys.filter(k=>suggestion[k]).map(k=><div key={k}><h3>{labels.fields[k]}</h3><p style={{whiteSpace:"pre-wrap"}}>{suggestion[k]}</p></div>)}</div><div className="form-actions"><button type="button" className="btn" onClick={()=>{setCv(suggestion);setSuggestion(null)}}>{c.apply}</button><button type="button" className="btn secondary" onClick={()=>setSuggestion(null)}>{c.discard}</button></div></section>}
  </div>
  <article className={"card cv-sheet cv-"+template} dir={language==="ar"?"rtl":"ltr"} lang={language}>
   <header className="cv-header"><h1>{cv.name||labels.fields.name}</h1><h3>{cv.title||labels.fields.title}</h3>{cv.goals&&<p>{cv.goals}</p>}</header>
   {cvFieldKeys.filter(k=>!["name","title","goals"].includes(k)&&cv[k].trim()).map(k=><section key={k} className="cv-section"><h2>{labels.fields[k]}</h2><div style={{whiteSpace:"pre-wrap"}}>{cv[k]}</div></section>)}
   {!cv.name&&!cv.summary&&<p className="empty">{c.empty}</p>}
   <footer className="muted cv-footer">Created with GazaWorks</footer>
  </article>
 </div>;
}
