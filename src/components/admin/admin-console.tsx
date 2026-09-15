"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {EmailTemplateEditor,LanguagesEditor,SettingsEditor,TaxonomyEditor} from "@/components/admin/admin-editors";
type Row=Record<string,unknown>;
const moduleEndpoint:Record<string,string>={
  "Overview":"/api/admin/analytics",
  "Users":"/api/admin/users",
  "Individuals":"/api/admin/users",
  "Teams":"/api/admin/users",
  "Clients":"/api/admin/users",
  "Verification":"/api/admin/verification",
  "Appointments":"/api/admin/appointments",
  "Message Moderation":"/api/admin/moderation",
  "Disputes":"/api/admin/disputes",
  "Appeals":"/api/admin/appeals",
  "Payouts":"/api/admin/payouts",
  "Blog":"/api/admin/articles",
  "Roles":"/api/admin/roles",
  "Static Pages":"/api/admin/pages",
  "Work Requests":"/api/admin/data?module=Work%20Requests",
  "Offers":"/api/admin/data?module=Offers",
  "Projects":"/api/admin/data?module=Projects",
  "Messages":"/api/admin/data?module=Messages",
  "Transactions":"/api/admin/data?module=Transactions",
  "Payments":"/api/admin/data?module=Payments",
  "Reviews":"/api/admin/data?module=Reviews",
  "Notifications":"/api/admin/data?module=Notifications",
  "Media":"/api/admin/data?module=Media",
  "Categories":"/api/admin/data?module=Categories",
  "Skills":"/api/admin/data?module=Skills",
  "Email Templates":"/api/admin/data?module=Email%20Templates",
  "AI Settings":"/api/admin/data?module=AI%20Settings",
  "Payment Settings":"/api/admin/data?module=Payment%20Settings",
  "System Settings":"/api/admin/data?module=System%20Settings",
  "Security Logs":"/api/admin/data?module=Security%20Logs",
  "Audit Logs":"/api/admin/data?module=Audit%20Logs",
  "Languages":"/api/admin/data?module=System%20Settings"
};
function Pretty({row}:{row:Row}){return <pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",fontSize:12,margin:0}}>{JSON.stringify(row,null,2)}</pre>}

export function AdminConsole({module,locale="en"}:{module:string;locale?:string}){
  const ar=locale==="ar";
  const endpoint=moduleEndpoint[module];
  const [rows,setRows]=useState<Row[]>([]),[message,setMessage]=useState(""),[loading,setLoading]=useState(false);
  const filtered=useMemo(()=>rows.filter(r=>{
    const type=String(r.account_type??"");
    if(module==="Individuals")return type==="individual";
    if(module==="Teams")return type==="team";
    if(module==="Clients")return type==="client";
    return true;
  }),[rows,module]);
  async function load(){if(!endpoint)return;setLoading(true);const r=await fetch(endpoint);const d=await r.json();setRows(r.ok?(Array.isArray(d)?d:[d]):[]);setMessage(r.ok?"":d.error??"Could not load this administrative module.");setLoading(false)}
  useEffect(()=>{void load()},[endpoint,module]);
  async function patch(body:Row){if(!endpoint)return;const r=await fetch(endpoint,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();setMessage(r.ok?"Saved.":d.error??"Update failed.");if(r.ok)await load()}

  if(!endpoint)return <div className="card"><h2>{module}</h2><p className="muted">This module is represented in the data model and permissions. Its specialized administration screen is not yet available in this branch.</p></div>;

  return <div className="grid">
    <div className="card"><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><span className="badge">{ar?"قاعدة البيانات الحية":"Live database"}</span><h2>{module}</h2></div><button className="btn secondary" onClick={()=>void load()}>{ar?"تحديث":"Refresh"}</button></div>{message&&<p role="status">{message}</p>}</div>
    {module==="Appointments"&&<AppointmentCreate onDone={load}/>}
    {(module==="Categories"||module==="Skills")&&<TaxonomyEditor kind={module==="Categories"?"category":"skill"} onDone={load}/>}
    {module==="Email Templates"&&<EmailTemplateEditor onDone={load}/>}
    {module==="Languages"&&<LanguagesEditor onDone={load}/>}
    {module==="AI Settings"&&<SettingsEditor defaultKey="ai_config" onDone={load}/>}
    {module==="Payment Settings"&&<SettingsEditor defaultKey="payment_methods" onDone={load}/>}
    {module==="System Settings"&&<SettingsEditor defaultKey="feature_flags" onDone={load}/>}
    {module==="Static Pages"&&<PageEditor onDone={load}/>}    {module==="Blog"&&<ArticleEditor onDone={load}/>}    {module==="Roles"&&<RoleEditor onDone={load}/>}
    {loading?<div className="empty">Loading…</div>:filtered.length?filtered.map((r,i)=><AdminRow key={String(r.id??i)} module={module} row={r} patch={patch}/>):<div className="empty">No records available, or this account lacks permission.</div>}
  </div>
}
function AdminRow({module,row,patch}:{module:string;row:Row;patch:(body:Row)=>Promise<void>}){
  return <div className="card grid"><Pretty row={row}/>
    {(module==="Users"||module==="Individuals"||module==="Teams"||module==="Clients")&&<div className="form-actions">
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"active"})}>Activate</button>
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"suspended"})}>Suspend</button>
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"banned"})}>Ban</button>
      {(module==="Individuals"||module==="Teams")&&<button className="btn secondary" onClick={()=>void patch({id:row.id,featured:true})}>Feature</button>}
    </div>}
    {module==="Verification"&&<div className="form-actions">{["under_review","interview_required","verified","changes_requested","rejected"].map(s=><button className="btn secondary" key={s} onClick={()=>void patch({id:row.id,status:s,reason:`Administrative decision: ${s}`})}>{s.replaceAll("_"," ")}</button>)}</div>}
    {module==="Appointments"&&<div className="form-actions">{["available","completed","no_show","cancelled"].map(s=><button className="btn secondary" key={s} onClick={()=>void patch({id:row.id,status:s})}>{s.replaceAll("_"," ")}</button>)}</div>}
    {module==="Message Moderation"&&<div className="form-actions"><button className="btn secondary" onClick={()=>void patch({id:row.id,decision:"approve"})}>Approve</button><button className="btn secondary" onClick={()=>void patch({id:row.id,decision:"reject"})}>Reject</button></div>}
    {module==="Disputes"&&<DisputeDecision row={row} patch={patch}/>}    {module==="Appeals"&&Boolean(row.id)&&<AppealDecision row={row} patch={patch}/>}
    {module==="Payouts"&&<div className="form-actions">{["approved","processing","paid","failed"].map(s=><button className="btn secondary" key={s} onClick={()=>void patch({id:row.id,status:s})}>{s}</button>)}</div>}
    {module==="Reviews"&&<div className="form-actions">{["published","hidden","removed"].map(s=><button className="btn secondary" key={s} onClick={()=>void patch({action:"review_moderation",id:row.id,status:s})}>{s}</button>)}</div>}
    {module==="Notifications"&&<div className="form-actions">{["open","assigned","resolved","dismissed"].map(s=><button className="btn secondary" key={s} onClick={()=>void patch({action:"notification",id:row.id,resolutionStatus:s})}>{s}</button>)}</div>}
    {(module==="Categories"||module==="Skills")&&<button className="btn secondary" onClick={()=>void patch({action:"taxonomy_active",kind:module==="Categories"?"category":"skill",id:row.id,active:!Boolean(row.active)})}>{Boolean(row.active)?"Disable":"Enable"}</button>}
  </div>
}
function AppointmentCreate({onDone}:{onDone:()=>Promise<void>}){
  const [msg,setMsg]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/admin/appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({startsAt:new Date(String(f.get("startsAt"))).toISOString(),endsAt:new Date(String(f.get("endsAt"))).toISOString(),internalNotes:f.get("notes")})});setMsg(r.ok?"Slot created.":"Could not create slot.");if(r.ok){e.currentTarget.reset();await onDone()}}
  return <form className="card grid" onSubmit={submit}><h3>Create verification slot</h3><div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}><label>Starts<input type="datetime-local" name="startsAt" required/></label><label>Ends<input type="datetime-local" name="endsAt" required/></label></div><label>Internal notes<textarea name="notes"/></label><button className="btn">Create slot</button><p>{msg}</p></form>
}
function PageEditor({onDone}:{onDone:()=>Promise<void>}){
  const [msg,setMsg]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/admin/pages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:f.get("slug"),locale:f.get("locale"),title:f.get("title"),body:f.get("body"),status:f.get("status")})});setMsg(r.ok?"Page saved.":"Could not save page.");if(r.ok)await onDone()}
  return <form className="card grid" onSubmit={submit}><h3>Edit or create page</h3><div className="grid" style={{gridTemplateColumns:"2fr 1fr 1fr"}}><label>Slug<input name="slug" required pattern="[a-z0-9-]+"/></label><label>Locale<select name="locale"><option>en</option><option>ar</option><option>tr</option><option>es</option><option>fr</option><option>de</option></select></label><label>Status<select name="status"><option>draft</option><option>published</option></select></label></div><label>Title<input name="title" required/></label><label>Body<textarea name="body" rows={10}/></label><button className="btn">Save page</button><p>{msg}</p></form>
}
function DisputeDecision({row,patch}:{row:Row;patch:(body:Row)=>Promise<void>}){
  const [worker,setWorker]=useState(0),[client,setClient]=useState(0),[reason,setReason]=useState("");
  return <div className="grid"><div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}><label>Worker award<input type="number" min="0" value={worker} onChange={e=>setWorker(Number(e.target.value))}/></label><label>Client refund<input type="number" min="0" value={client} onChange={e=>setClient(Number(e.target.value))}/></label></div><label>Reasoning<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4}/></label><button className="btn" disabled={reason.length<10} onClick={()=>void patch({id:row.id,decision:worker===0?"client_full":client===0?"worker_full":"split",workerAwardMinor:worker,clientRefundMinor:client,reasoning:reason})}>Issue decision</button></div>
}

function ArticleEditor({onDone}:{onDone:()=>Promise<void>}){
  const [msg,setMsg]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const f=new FormData(e.currentTarget);
    const r=await fetch("/api/admin/articles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:f.get("slug"),locale:f.get("locale"),title:f.get("title"),excerpt:f.get("excerpt"),body:f.get("body"),status:f.get("status")})});
    setMsg(r.ok?"Article saved.":"Could not save article.");if(r.ok)await onDone();
  }
  return <form className="card grid" onSubmit={submit}><h3>Create or translate article</h3><div className="grid" style={{gridTemplateColumns:"2fr 1fr 1fr"}}><label>Slug<input name="slug" required pattern="[a-z0-9-]+"/></label><label>Locale<select name="locale"><option>en</option><option>ar</option><option>tr</option><option>es</option><option>fr</option><option>de</option></select></label><label>Status<select name="status"><option>draft</option><option>published</option></select></label></div><label>Title<input name="title" required/></label><label>Excerpt<textarea name="excerpt" rows={3}/></label><label>Body<textarea name="body" rows={12} required/></label><button className="btn">Save article</button><p>{msg}</p></form>
}
function RoleEditor({onDone}:{onDone:()=>Promise<void>}){
  const [msg,setMsg]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const f=new FormData(e.currentTarget);const permissions=String(f.get("permissions")??"").split(",").map(x=>x.trim()).filter(Boolean);
    const r=await fetch("/api/admin/roles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.get("name"),description:f.get("description"),permissions})});
    setMsg(r.ok?"Role created.":"Could not create role. Use valid permission keys.");if(r.ok){e.currentTarget.reset();await onDone()}
  }
  return <form className="card grid" onSubmit={submit}><h3>Create custom admin role</h3><label>Name<input name="name" required/></label><label>Description<textarea name="description"/></label><label>Permission keys, comma separated<input name="permissions" placeholder="users.read, content.edit"/></label><button className="btn">Create role</button><p>{msg}</p></form>
}
function AppealDecision({row,patch}:{row:Row;patch:(body:Row)=>Promise<void>}){
  const [worker,setWorker]=useState(0),[client,setClient]=useState(0),[reason,setReason]=useState("");
  return <div className="grid"><h3>Final appeal decision</h3><div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}><label>Worker award<input type="number" min="0" value={worker} onChange={e=>setWorker(Number(e.target.value))}/></label><label>Client refund<input type="number" min="0" value={client} onChange={e=>setClient(Number(e.target.value))}/></label></div><label>Final reasoning<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4}/></label><button className="btn" disabled={reason.length<10} onClick={()=>void patch({id:row.id,workerAwardMinor:worker,clientRefundMinor:client,reasoning:reason})}>Finalize appeal</button></div>
}
