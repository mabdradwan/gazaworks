"use client";
import {apiFetch} from "@/lib/api-fetch";
import {EmailTemplatePanel} from "@/components/admin/email-template-panel";
import {EmailOutboxPanel} from "@/components/admin/email-outbox-panel";
import {AppointmentsPanel} from "@/components/admin/appointments-panel";
import {AnalyticsPanel} from "@/components/admin/analytics-panel";
import {PayoutEditor,VerificationEditor,ModerationEditor} from "@/components/admin/workflow-editors";
import {useCallback,useEffect,useMemo,useState} from "react";
import {adminEditorCopy} from "@/lib/admin-editor-copy";
import {adminCopy} from "@/lib/admin-copy";
import {RecordDetails} from "@/components/admin/record-details";
import {adminRecordLabel} from "@/lib/admin-record-copy";
import {adminWorkflowError} from "@/domain/admin-workflow-error";
import {LoadingIndicator} from "@/components/loading-indicator";
import {LanguagesEditor,SettingsEditor,TaxonomyEditor,ContentEditor,RoleEditor} from "@/components/admin/admin-editors";
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

function ModuleConsole({module,locale="en"}:{module:string;locale?:string}){
  const c=adminEditorCopy(locale);
  const endpoint=moduleEndpoint[module];
  const [rows,setRows]=useState<Row[]>([]),[message,setMessage]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
  const filtered=useMemo(()=>rows.filter(r=>{
    const type=String(r.account_type??"");
    if(module==="Individuals")return type==="individual";
    if(module==="Teams")return type==="team";
    if(module==="Clients")return type==="client";
    return true;
  }),[rows,module]);
  const load=useCallback(async()=>{if(!endpoint)return;setLoading(true);try{const r=await apiFetch(endpoint);const d=await r.json();setRows(r.ok?(Array.isArray(d)?d:[d]):[]);setMessage(r.ok?"":c.loadError)}catch{setMessage(c.loadError)}finally{setLoading(false)}},[endpoint,c.loadError]);
  useEffect(()=>{void load()},[load]);
  async function patch(body:Row){
    if(!endpoint||saving)return;setSaving(true);
    try{
      const r=await apiFetch(endpoint,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const result=await r.json();
      setMessage(r.ok?c.saved:adminWorkflowError(locale,result.error,r.status));if(r.ok)await load();
    }catch{setMessage(c.saveError)}finally{setSaving(false)}
  }

  if(!endpoint)return <div className="card"><h2>{adminCopy(locale).label(module)}</h2><p className="muted">{c.unavailableModule}</p></div>;

  return <div className="grid">
    <div className="card"><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><span className="badge">{c.live}</span><h2>{adminCopy(locale).label(module)}</h2></div><button className="btn secondary" disabled={loading||saving} onClick={()=>void load()}>{c.refresh}</button></div>{message&&<p role="status">{message}</p>}</div>
    {(module==="Categories"||module==="Skills")&&<TaxonomyEditor locale={locale} kind={module==="Categories"?"category":"skill"} onDone={load}/>}
    {module==="Languages"&&<LanguagesEditor locale={locale} value={rows.find(row=>row.key==="supported_locales")?.value} onDone={load}/>}
    {!loading&&(module==="AI Settings"||module==="Payment Settings"||module==="System Settings")&&rows.map(row=><SettingsEditor key={String(row.key)+String(row.updated_at)} locale={locale} defaultKey={String(row.key)} value={row.value} isPublic={Boolean(row.public)} onDone={load}/>)}
    {!loading&&!message&&!rows.length&&(module==="AI Settings"||module==="Payment Settings"||module==="System Settings")&&<SettingsEditor locale={locale} defaultKey={module==="AI Settings"?"ai_config":module==="Payment Settings"?"payment_methods":"feature_flags"} onDone={load}/>}
    {module==="Static Pages"&&<ContentEditor kind="page" locale={locale} onDone={load}/>}    {module==="Blog"&&<ContentEditor kind="article" locale={locale} onDone={load}/>}    {module==="Roles"&&<RoleEditor locale={locale} onDone={load}/>}
    {loading?<LoadingIndicator locale={locale} label={c.loading}/>:filtered.length?filtered.map((r,i)=><AdminRow key={String(r.id??i)} module={module} row={r} patch={patch} locale={locale} busy={saving}/>):<div className="empty">{c.empty}</div>}
  </div>
}
function AdminRow({module,row,patch,locale,busy}:{module:string;row:Row;patch:(body:Row)=>Promise<void>;locale:string;busy:boolean}){
  const c=adminEditorCopy(locale);
  const owner=row.profiles as Row|undefined;
  const title=String(row.display_name??row.title??row.subject??row.name??owner?.display_name??adminCopy(locale).label(module));
  const summary=Object.fromEntries(Object.entries(row).filter(([key])=>["status","account_status","submitted_at","created_at","account_type"].includes(key)));
  return <details className="card admin-record-disclosure" aria-busy={busy}>
    <summary className="admin-record-summary"><strong dir="auto">{title}</strong><RecordDetails row={summary} locale={locale}/><span className="admin-record-expand">{adminRecordLabel(locale,"details")}</span></summary>
    <div className="grid admin-record-expanded"><RecordDetails row={row} locale={locale}/>{busy&&<LoadingIndicator locale={locale}/>}<fieldset className="admin-form-fields grid" disabled={busy}>
    {(module==="Users"||module==="Individuals"||module==="Teams"||module==="Clients")&&<div className="form-actions">
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"active"})}>{c.activate}</button>
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"suspended"})}>{c.suspend}</button>
      <button className="btn secondary" onClick={()=>void patch({id:row.id,status:"banned"})}>{c.ban}</button>
      {(module==="Individuals"||module==="Teams")&&<button className="btn secondary" onClick={()=>void patch({id:row.id,featured:true})}>{c.feature}</button>}
    </div>}
    {module==="Verification"&&<VerificationEditor row={row} patch={patch} locale={locale}/>}
    {module==="Message Moderation"&&<ModerationEditor row={row} patch={patch} locale={locale}/>}
    {module==="Disputes"&&<DisputeDecision row={row} patch={patch} locale={locale}/>}    {module==="Appeals"&&Boolean(row.id)&&<AppealDecision row={row} patch={patch} locale={locale}/>}
    {module==="Payouts"&&<PayoutEditor row={row} patch={patch} locale={locale}/>}
    {module==="Reviews"&&<div className="form-actions">{(["published","hidden","removed"] as const).map(s=><button className="btn secondary" key={s} onClick={()=>void patch({action:"review_moderation",id:row.id,status:s})}>{c[s]}</button>)}</div>}
    {module==="Notifications"&&<div className="form-actions">{(["open","assigned","resolved","dismissed"] as const).map(s=><button className="btn secondary" key={s} onClick={()=>void patch({action:"notification",id:row.id,resolutionStatus:s})}>{c[s]}</button>)}</div>}
    {(module==="Categories"||module==="Skills")&&<button className="btn secondary" onClick={()=>void patch({action:"taxonomy_active",kind:module==="Categories"?"category":"skill",id:row.id,active:!Boolean(row.active)})}>{Boolean(row.active)?c.disable:c.enable}</button>}
  </fieldset></div></details>
}
function DisputeDecision({row,patch,locale}:{row:Row;patch:(body:Row)=>Promise<void>;locale:string}){
  const c=adminEditorCopy(locale);
  const [worker,setWorker]=useState(0),[client,setClient]=useState(0),[reason,setReason]=useState("");
  return <div className="grid"><div className="form-grid two"><label>{c.workerAward}<input type="number" min="0" step="1" value={worker} onChange={e=>setWorker(Number(e.target.value))}/></label><label>{c.clientRefund}<input type="number" min="0" step="1" value={client} onChange={e=>setClient(Number(e.target.value))}/></label></div><label>{c.reasoning}<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4}/></label><button className="btn" disabled={reason.length<10} onClick={()=>void patch({id:row.id,decision:worker===0?"client_full":client===0?"worker_full":"split",workerAwardMinor:worker,clientRefundMinor:client,reasoning:reason})}>{c.issueDecision}</button></div>
}

function AppealDecision({row,patch,locale}:{row:Row;patch:(body:Row)=>Promise<void>;locale:string}){
  const c=adminEditorCopy(locale);
  const [worker,setWorker]=useState(0),[client,setClient]=useState(0),[reason,setReason]=useState("");
  return <div className="grid"><h3>{c.finalAppeal}</h3><div className="form-grid two"><label>{c.workerAward}<input type="number" min="0" step="1" value={worker} onChange={e=>setWorker(Number(e.target.value))}/></label><label>{c.clientRefund}<input type="number" min="0" step="1" value={client} onChange={e=>setClient(Number(e.target.value))}/></label></div><label>{c.reasoning}<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4}/></label><button className="btn" disabled={reason.length<10} onClick={()=>void patch({id:row.id,workerAwardMinor:worker,clientRefundMinor:client,reasoning:reason})}>{c.finalizeAppeal}</button></div>
}


export function AdminConsole({module,locale="en"}:{module:string;locale?:string}){return module==="Email Templates"?<EmailTemplatePanel locale={locale}/>:module==="Email Outbox"?<EmailOutboxPanel locale={locale}/>:module==="Appointments"?<AppointmentsPanel locale={locale}/>:module==="Overview"?<AnalyticsPanel locale={locale}/>:<ModuleConsole key={module} module={module} locale={locale}/>}
