"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {workspaceFormCopy} from "@/lib/workspace-form-copy";

type Category={id:string;slug:string;category_translations:{locale:string;name:string}[]};
type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type RequestRow={id:string;title:string;description:string;budget_min_minor:number;budget_max_minor:number;currency:string;status:string;visibility:string;delivery_expectations?:string|null;notes?:string|null;created_at:string};

export function WorkRequestForm({locale="en"}:{locale?:string}){
  const {workRequests:c,localeTag}=workspaceFormCopy(locale);
  const [message,setMessage]=useState(""),[categories,setCategories]=useState<Category[]>([]),[skills,setSkills]=useState<Skill[]>([]),[requests,setRequests]=useState<RequestRow[]>([]),[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false);

  const name=(translations:{locale:string;name:string}[],slug:string)=>translations.find(t=>t.locale===locale)?.name??translations.find(t=>t.locale==="en")?.name??slug;
  async function load(){
    const [t,r]=await Promise.all([apiFetch("/api/taxonomy"),apiFetch("/api/work-requests?mine=1")]);
    if(t.ok){const x=await t.json();setCategories(x.categories??[]);setSkills(x.skills??[])}
    if(r.ok)setRequests(await r.json());
  }
  useEffect(()=>{void load()},[]);

  async function uploadFiles(workRequestId:string){
    for(const file of files){
      const prep=await apiFetch("/api/work-requests/files",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId,fileName:file.name,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});
      const p=await prep.json();if(!prep.ok)throw new Error(p.error??"attachment_prepare_failed");
      const db=supabaseBrowser();const {error}=await db.storage.from("work-request-files").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type||"application/octet-stream"});
      if(error)throw error;
      const done=await apiFetch("/api/work-requests/files",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId,path:p.path,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});
      if(!done.ok)throw new Error("attachment_record_failed");
    }
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage(c.publishingMessage);
    const formEl=e.currentTarget,f=new FormData(formEl);
    const min=Math.round(Number(f.get("budgetMin"))*100),max=Math.round(Number(f.get("budgetMax"))*100);
    const r=await apiFetch("/api/work-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      title:f.get("title"),description:f.get("description"),categoryId:f.get("categoryId"),
      skills:f.getAll("skills"),budgetMin:min,budgetMax:max,currency:f.get("currency"),
      visibility:f.get("visibility"),deliveryExpectations:f.get("deliveryExpectations"),notes:f.get("notes")
    })});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){setMessage(c.publishFailed);setBusy(false);return}
    try{if(files.length)await uploadFiles(String(d.id));setMessage(c.published);formEl.reset();setFiles([]);await load()}
    catch{setMessage(c.attachmentFailed)}
    setBusy(false);
  }

  async function setStatus(id:string,status:"published"|"closed"|"cancelled"){
    const r=await apiFetch("/api/work-requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    if(r.ok)await load();else setMessage(c.statusFailed);
  }

  return <div className="grid">
    <form className="card grid" onSubmit={submit}>
      <div><h2>{c.createTitle}</h2><p className="muted">{c.createBody}</p></div>
      <label>{c.title}<input name="title" required minLength={5} placeholder={c.titlePlaceholder}/></label>
      <label>{c.description}<textarea name="description" required minLength={30} rows={7}/></label>
      <label>{c.category}<select name="categoryId" required><option value="">{c.chooseCategory}</option>{categories.map(category=><option key={category.id} value={category.id}>{name(category.category_translations,category.slug)}</option>)}</select></label>
      <fieldset className="card"><legend>{c.requiredSkills}</legend><div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skills" value={s.id}/><span>{name(s.skill_translations,s.slug)}</span></label>)}</div></fieldset>
      <div className="form-grid two"><label>{c.minimumBudget}<input name="budgetMin" type="number" min="0.01" step="0.01" required/></label><label>{c.maximumBudget}<input name="budgetMax" type="number" min="0.01" step="0.01" required/></label></div>
      <label>{c.currency}<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label>
      <label>{c.deliveryExpectations}<textarea name="deliveryExpectations" rows={3} placeholder={c.deliveryPlaceholder}/></label>
      <label>{c.additionalNotes}<textarea name="notes" rows={3}/></label>
      <label>{c.visibility}<select name="visibility"><option value="public">{c.publicVisibility}</option><option value="invite_only">{c.privateVisibility}</option></select></label>
      <label>{c.attachments} <small className="muted">{c.sizeHint}</small><input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files??[]))}/></label>
      {files.length>0&&<div className="upload-list">{files.map(f=><small key={f.name}>{f.name} · {(f.size/1024/1024).toFixed(1)} MB</small>)}</div>}
      <button className="btn" disabled={busy}>{busy?c.publishing:c.publish}</button><p role="status">{message}</p>
    </form>

    <div className="grid">
      <h2>{c.yourRequests}</h2>
      {requests.length?requests.map(x=>{
        const money=new Intl.NumberFormat(localeTag,{style:"currency",currency:x.currency}).format(x.budget_min_minor/100)+" – "+new Intl.NumberFormat(localeTag,{style:"currency",currency:x.currency}).format(x.budget_max_minor/100);
        const status=c.statuses[x.status as keyof typeof c.statuses]??x.status.replaceAll("_"," "),visibility=c.visibilityModes[x.visibility as keyof typeof c.visibilityModes]??x.visibility.replaceAll("_"," ");
        return <article className="card request-card" key={x.id}><div className="card-head"><div><span className="badge">{status}</span><h3>{x.title}</h3></div><strong>{money}</strong></div><p className="muted">{x.description}</p><div className="meta-grid"><span>{c.visibility}: {visibility}</span><span>{c.created}: {new Date(x.created_at).toLocaleDateString(localeTag)}</span></div>{x.delivery_expectations&&<p><strong>{c.delivery}:</strong> {x.delivery_expectations}</p>}<details><summary>{c.reference}</summary><code>{x.id}</code></details><div className="form-actions">{x.status!=="closed"&&<button className="btn secondary" onClick={()=>void setStatus(x.id,"closed")}>{c.close}</button>}{x.status!=="cancelled"&&<button className="btn secondary" onClick={()=>void setStatus(x.id,"cancelled")}>{c.cancel}</button>}</div></article>
      }):<div className="empty">{c.empty}</div>}
    </div>
  </div>
}
