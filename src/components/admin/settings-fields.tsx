"use client";
import {useState} from "react";
import {adminRecordLabel} from "@/lib/admin-record-copy";
export function SettingsFields({value,onChange,locale,name=""}:{value:unknown;onChange:(value:unknown)=>void;locale:string;name?:string}){
 const [newName,setNewName]=useState(""),[kind,setKind]=useState("text");
 const c=(key:string)=>adminRecordLabel(locale,key);
 if(Array.isArray(value))return <div className="grid">{value.map((item,index)=><SettingsFields key={index} value={item} locale={locale} name={String(index+1)} onChange={next=>onChange(value.map((entry,i)=>i===index?next:entry))}/>)}<button type="button" className="btn secondary" onClick={()=>onChange([...value,""])}>{c("add")}</button></div>;
 if(value&&typeof value==="object"){
  const object=value as Record<string,unknown>;
  return <div className="grid admin-settings-group">{name&&<strong>{c(name)}</strong>}{Object.entries(object).map(([key,item])=><SettingsFields key={key} value={item} locale={locale} name={key} onChange={next=>onChange({...object,[key]:next})}/>)}<div className="form-grid three"><label>{c("fieldName")}<input value={newName} onChange={e=>setNewName(e.target.value)} maxLength={120}/></label><label>{c("fieldType")}<select value={kind} onChange={e=>setKind(e.target.value)}>{["text","number","boolean","group","list"].map(type=><option value={type} key={type}>{c(type)}</option>)}</select></label><button type="button" className="btn secondary" disabled={!newName.trim()||Object.hasOwn(object,newName.trim())||["__proto__","constructor","prototype"].includes(newName.trim())} onClick={()=>{const key=newName.trim();if(!key||Object.hasOwn(object,key)||["__proto__","constructor","prototype"].includes(key))return;onChange({...object,[key]:kind==="number"?0:kind==="boolean"?false:kind==="group"?{}:kind==="list"?[]:""});setNewName("")}}>{c("addField")}</button></div></div>;
 }
 if(typeof value==="boolean")return <label className="admin-setting-toggle"><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/><span>{c(name)}</span></label>;
 if(typeof value==="number")return <label>{c(name)}<input type="number" step="any" value={value} onChange={e=>{if(e.target.value!==""&&Number.isFinite(e.target.valueAsNumber))onChange(e.target.valueAsNumber)}}/></label>;
 return <label>{c(name||"value")}<textarea rows={2} dir="auto" value={value===null||value===undefined?"":String(value)} onChange={e=>onChange(e.target.value)}/></label>;
}
