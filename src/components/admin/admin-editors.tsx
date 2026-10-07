"use client";
import {apiFetch} from "@/lib/api-fetch";
import {adminEditorCopy} from "@/lib/admin-editor-copy";
import {localeNativeName} from "@/components/locale-switcher";
import {locales,isLocale} from "@/lib/i18n";
import {enabledLocaleList} from "@/domain/locale-settings";
import {FormEvent,type ReactNode,useState} from "react";
import {SettingsFields} from "@/components/admin/settings-fields";
import {LoadingIndicator} from "@/components/loading-indicator";
import {adminRecordLabel} from "@/lib/admin-record-copy";

async function jsonRequest(url:string,method:string,body:unknown){
  return apiFetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
}

export function AdminSaveForm({locale,onDone,save,children,reset=false}:{locale:string;onDone:()=>Promise<void>;save:(form:HTMLFormElement)=>Promise<Response>;children:ReactNode;reset?:boolean}){
  const c=adminEditorCopy(locale),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(busy)return;
    const form=e.currentTarget;setBusy(true);setMessage("");
    try{
      const r=await save(form);
      setMessage(r.ok?c.saved:r.status===422?c.invalidJson:c.saveError);
      if(r.ok){if(reset)form.reset();await onDone()}
    }catch{setMessage(c.saveError)}finally{setBusy(false)}
  }
  return <form className="card grid" onSubmit={submit} aria-busy={busy}>
    <fieldset className="admin-form-fields grid" disabled={busy}>{children}</fieldset>
    {busy?<LoadingIndicator locale={locale} label={c.loading}/>:<p role="status" aria-live="polite">{message}</p>}
  </form>;
}

export function TaxonomyEditor({kind,onDone,locale="en"}:{kind:"category"|"skill";onDone:()=>Promise<void>;locale?:string}){
  const c=adminEditorCopy(locale);
  async function save(form:HTMLFormElement){
    const f=new FormData(form),translations=Object.fromEntries(locales.map(language=>[language,String(f.get(language)??"").trim()]).filter(([,value])=>Boolean(value)));
    return jsonRequest("/api/admin/taxonomy","POST",{kind,slug:f.get("slug"),translations});
  }
  return <AdminSaveForm locale={locale} onDone={onDone} save={save} reset>
    <h3>{kind==="category"?c.createCategory:c.createSkill}</h3>
    <label>{c.slug}<input name="slug" required pattern="[a-z0-9-]+" minLength={2} maxLength={100} dir="ltr"/></label>
    <div className="form-grid three">{locales.map(language=><label key={language}>{localeNativeName[language]}<input name={language} lang={language} dir={language==="ar"?"rtl":"ltr"} required={language==="en"||language==="ar"} maxLength={150}/></label>)}</div>
    <button className="btn">{c.create}</button>
  </AdminSaveForm>;
}

export function SettingsEditor({defaultKey,onDone,locale="en",value={},isPublic=false}:{defaultKey:string;onDone:()=>Promise<void>;locale?:string;value?:unknown;isPublic?:boolean}){
  const c=adminEditorCopy(locale),[setting,setSetting]=useState<unknown>(value);
  async function save(form:HTMLFormElement){
    const f=new FormData(form);
    return jsonRequest("/api/admin/data","PATCH",{action:"setting",key:f.get("key"),value:setting,isPublic});
  }
  return <AdminSaveForm locale={locale} onDone={onDone} save={save}>
    <h3>{adminRecordLabel(locale,defaultKey)}</h3><input type="hidden" name="key" value={defaultKey}/>
    <SettingsFields value={setting} onChange={setSetting} locale={locale}/><button className="btn">{c.saveSettings}</button>
  </AdminSaveForm>;
}

export function LanguagesEditor({onDone,locale="en",value}:{onDone:()=>Promise<void>;locale?:string;value?:unknown}){
  const c=adminEditorCopy(locale),enabled=enabledLocaleList(value);
  async function save(form:HTMLFormElement){
    const f=new FormData(form),chosen=f.getAll("languages").map(String).filter(isLocale);
    return jsonRequest("/api/admin/data","PATCH",{action:"setting",key:"supported_locales",value:{locales:[...new Set(["en",...chosen])],default:"en"},isPublic:true});
  }
  return <AdminSaveForm key={JSON.stringify(enabled)} locale={locale} onDone={onDone} save={save}>
    <h3>{c.languagesHeading}</h3><p className="muted">{c.languagesHint}</p>
    <div className="skill-grid">{locales.map(language=><label className="skill-option" key={language}><input name="languages" value={language} type="checkbox" defaultChecked={enabled.includes(language)} disabled={language==="en"}/><span>{localeNativeName[language]}</span></label>)}</div>
    <button className="btn">{c.saveLanguages}</button>
  </AdminSaveForm>;
}

export function ContentEditor({kind,onDone,locale}:{kind:"page"|"article";onDone:()=>Promise<void>;locale:string}){
  const c=adminEditorCopy(locale),article=kind==="article";
  async function save(form:HTMLFormElement){
    const f=new FormData(form);
    return jsonRequest(article?"/api/admin/articles":"/api/admin/pages","POST",{slug:f.get("slug"),locale:f.get("locale"),title:f.get("title"),body:f.get("body"),status:f.get("status"),...(article?{excerpt:f.get("excerpt")}:{})});
  }
  return <AdminSaveForm locale={locale} onDone={onDone} save={save}>
    <h3>{article?c.articleHeading:c.pageHeading}</h3>
    <div className="form-grid three"><label>{c.slug}<input name="slug" required pattern="[a-z0-9-]+" maxLength={100} dir="ltr"/></label>
      <label>{c.language}<select name="locale" defaultValue={isLocale(locale)?locale:"en"}>{locales.map(language=><option value={language} key={language}>{localeNativeName[language]}</option>)}</select></label>
      <label>{c.status}<select name="status"><option value="draft">{c.draft}</option><option value="published">{c.published}</option></select></label></div>
    <label>{c.title}<input name="title" required minLength={2} maxLength={article?250:200}/></label>
    {article&&<label>{c.excerpt}<textarea name="excerpt" rows={3} maxLength={1000}/></label>}
    <label>{c.body}<textarea name="body" rows={12} required={article} maxLength={article?200000:100000}/></label>
    <button className="btn">{article?c.saveArticle:c.savePage}</button>
  </AdminSaveForm>;
}

export function RoleEditor({onDone,locale}:{onDone:()=>Promise<void>;locale:string}){
  const c=adminEditorCopy(locale);
  async function save(form:HTMLFormElement){
    const f=new FormData(form),permissions=String(f.get("permissions")??"").split(",").map(x=>x.trim()).filter(Boolean);
    return jsonRequest("/api/admin/roles","POST",{name:f.get("name"),description:f.get("description"),permissions});
  }
  return <AdminSaveForm locale={locale} onDone={onDone} save={save} reset>
    <h3>{c.roleHeading}</h3><label>{c.name}<input name="name" required minLength={2} maxLength={80}/></label>
    <label>{c.description}<textarea name="description" maxLength={500}/></label><label>{c.permissions}<input name="permissions" placeholder="users.read, content.edit" dir="ltr"/></label>
    <button className="btn">{c.createRole}</button>
  </AdminSaveForm>;
}
