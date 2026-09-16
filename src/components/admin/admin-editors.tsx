"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useState} from "react";

const supported=["ar","en","tr","es","fr","de"] as const;

async function jsonRequest(url:string,method:string,body:unknown){
  return apiFetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
}

export function TaxonomyEditor({kind,onDone}:{kind:"category"|"skill";onDone:()=>Promise<void>}){
  const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formEl=e.currentTarget,f=new FormData(formEl);
    const translations=Object.fromEntries(supported.map(locale=>[locale,String(f.get(locale)??"").trim()]).filter(([,value])=>Boolean(value)));
    const r=await jsonRequest("/api/admin/taxonomy","POST",{kind,slug:f.get("slug"),translations});
    setMessage(r.ok?"Created successfully.":"Could not create this item.");
    if(r.ok){formEl.reset();await onDone()}
  }
  return <form className="card grid" onSubmit={submit}>
    <h3>{kind==="category"?"Create category":"Create skill"}</h3>
    <label>Slug<input name="slug" required pattern="[a-z0-9-]+"/></label>
    <div className="form-grid three">{supported.map(locale=><label key={locale}>{locale.toUpperCase()} name<input name={locale} required={locale==="en"||locale==="ar"}/></label>)}</div>
    <button className="btn">Create</button><p role="status">{message}</p>
  </form>
}

export function SettingsEditor({defaultKey,onDone}:{defaultKey:string;onDone:()=>Promise<void>}){
  const [key,setKey]=useState(defaultKey),[value,setValue]=useState("{}"),[message,setMessage]=useState("");
  async function save(){
    let parsed:unknown;
    try{parsed=JSON.parse(value)}catch{setMessage("Enter valid JSON.");return}
    const r=await jsonRequest("/api/admin/data","PATCH",{action:"setting",key,value:parsed,isPublic:false});
    setMessage(r.ok?"Setting saved.":"Could not save setting.");
    if(r.ok)await onDone();
  }
  return <div className="card grid"><h3>Operational setting</h3><label>Key<input value={key} onChange={e=>setKey(e.target.value)}/></label><label>JSON value<textarea rows={8} value={value} onChange={e=>setValue(e.target.value)}/></label><button type="button" className="btn" onClick={()=>void save()}>Save setting</button><p role="status">{message}</p></div>
}

export function LanguagesEditor({onDone}:{onDone:()=>Promise<void>}){
  const [enabled,setEnabled]=useState<string[]>([...supported]),[message,setMessage]=useState("");
  async function save(){
    if(!enabled.includes("en")){setMessage("English must remain enabled as the fallback locale.");return}
    const r=await jsonRequest("/api/admin/data","PATCH",{action:"setting",key:"supported_locales",value:{locales:enabled,default:"en"},isPublic:true});
    setMessage(r.ok?"Language configuration saved.":"Could not save language configuration.");
    if(r.ok)await onDone();
  }
  return <div className="card grid"><h3>Supported interface languages</h3><p className="muted">Arabic uses RTL. English is the fallback. Additional languages can be added to the architecture in future releases.</p><div className="skill-grid">{supported.map(locale=><label className="skill-option" key={locale}><input type="checkbox" checked={enabled.includes(locale)} onChange={e=>setEnabled(v=>e.target.checked?[...v,locale]:v.filter(x=>x!==locale))}/><span>{locale.toUpperCase()}{locale==="ar"?" · RTL":" · LTR"}</span></label>)}</div><button type="button" className="btn" onClick={()=>void save()}>Save languages</button><p role="status">{message}</p></div>
}

