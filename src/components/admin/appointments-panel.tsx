"use client";
import {useCallback,useEffect,useRef,useState,type FormEvent} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {appointmentCopy,appointmentError,appointmentState,appointmentTime} from "@/lib/appointment-copy";
import {appointmentStatuses,localDateTime,type AdminAppointment,type StaffMember} from "@/domain/appointments";

type Change=(body:Record<string,unknown>,method?:"POST"|"PATCH")=>Promise<boolean>;
type EditorProps={locale:string;staff:StaffMember[];busy:boolean;change:Change;zone:string};

export function AppointmentsPanel({locale}:{locale:string}){
 const c=appointmentCopy(locale);
 const [rows,setRows]=useState<AdminAppointment[]>([]),[staff,setStaff]=useState<StaffMember[]>([]),[total,setTotal]=useState(0);
 const [page,setPage]=useState(0),[status,setStatus]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[zone,setZone]=useState("UTC");
 const generation=useRef(0),writing=useRef(false);
 const load=useCallback(async()=>{
  const current=++generation.current;setLoading(true);
  const response=await apiFetch(`/api/admin/appointments?page=${page}&status=${status}`),data=await response.json();
  if(current!==generation.current)return;
  if(response.ok){setRows(data.appointments);setStaff(data.staff);setTotal(data.total);}
  else{setRows([]);setMessage(appointmentCopy(locale).loadFailed);}
  setLoading(false);
 },[page,status,locale]);
 useEffect(()=>{setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);void load();return()=>{generation.current+=1;};},[load]);
 async function change(body:Record<string,unknown>,method:"POST"|"PATCH"="PATCH"){
  if(writing.current)return false;
  writing.current=true;setBusy(true);setMessage("");
  try{
   const response=await apiFetch("/api/admin/appointments",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),data=await response.json();
   setMessage(response.ok?c.saved:appointmentError(locale,data.error));
   if(response.ok)await load();
   return response.ok;
  }finally{writing.current=false;setBusy(false);}
 }
 return <div className="grid">
  <section className="card grid"><h2>{c.title}</h2><p>{c.reviewOnly}</p><p className="muted">{c.gazaTime}</p>
   <div className="form-actions"><label>{c.statusTitle}<select value={status} disabled={busy} onChange={e=>{setPage(0);setStatus(e.target.value);}}><option value="">{c.all}</option>{appointmentStatuses.map(s=><option key={s} value={s}>{appointmentState(locale,s)}</option>)}</select></label><button className="btn secondary" disabled={loading||busy} onClick={()=>void load()}>{c.refresh}</button></div>
   {message&&<p role="status">{message}</p>}
  </section>
  <CreateSlot locale={locale} staff={staff} busy={busy||loading} change={change} zone={zone}/>
  {loading?<p role="status">{c.loading}</p>:rows.length?rows.map(row=><AppointmentEditor key={row.id+":"+row.version} row={row} locale={locale} staff={staff} busy={busy} change={change} zone={zone}/>):<p className="empty">{c.emptySlots}</p>}
  <div className="form-actions"><button className="btn secondary" disabled={page===0||loading||busy} onClick={()=>setPage(p=>p-1)}>{c.previous}</button><span>{page+1} / {Math.max(1,Math.ceil(total/25))}</span><button className="btn secondary" disabled={(page+1)*25>=total||loading||busy} onClick={()=>setPage(p=>p+1)}>{c.next}</button></div>
 </div>;
}

function StaffSelect({locale,staff,value,name="employeeId"}:{locale:string;staff:StaffMember[];value?:string|null;name?:string}){
 const c=appointmentCopy(locale);
 return <label>{c.staff}<select name={name} defaultValue={value??""}><option value="">{c.unassigned}</option>{staff.map(s=><option key={s.id} value={s.id}>{s.display_name}</option>)}</select></label>;
}

function CreateSlot({locale,staff,busy,change,zone}:EditorProps){
 const c=appointmentCopy(locale),[error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget,data=new FormData(form);setError("");
  try{
   const ok=await change({startsAt:new Date(String(data.get("starts"))).toISOString(),endsAt:new Date(String(data.get("ends"))).toISOString(),employeeId:data.get("employeeId")||null,userNotes:data.get("instructions"),internalNotes:data.get("notes"),status:data.get("status")},"POST");
   if(ok)form.reset();
  }catch{setError(c.invalidTime);}
 }
 return <details className="card"><summary>{c.create}</summary><form className="grid" onSubmit={submit}><fieldset disabled={busy} className="appointment-fields">
  <p className="muted">{c.timeZone}: <bdi>{zone}</bdi></p>
  <div className="form-grid two"><label>{c.starts}<input type="datetime-local" name="starts" required/></label><label>{c.ends}<input type="datetime-local" name="ends" required/></label></div>
  <StaffSelect locale={locale} staff={staff}/><label>{c.statusTitle}<select name="status"><option value="available">{appointmentState(locale,"available")}</option><option value="blocked">{appointmentState(locale,"blocked")}</option></select></label>
  <label>{c.instructions}<textarea name="instructions" maxLength={2000}/></label><label>{c.internalNotes}<textarea name="notes" maxLength={5000}/></label>
  <button className="btn">{c.create}</button>{error&&<p role="alert">{error}</p>}
 </fieldset></form></details>;
}

function AppointmentEditor({row,locale,staff,busy,change,zone}:EditorProps & {row:AdminAppointment}){
 const c=appointmentCopy(locale),[error,setError]=useState("");
 const closed=["cancelled","completed","no_show"].includes(row.status),started=new Date(row.starts_at).getTime()<=Date.now(),ended=new Date(row.ends_at).getTime()<=Date.now();
 const patch=(body:Record<string,unknown>)=>change({id:row.id,version:row.version,...body});
 async function submitTime(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const data=new FormData(event.currentTarget);setError("");
  try{await patch({action:"reschedule",startsAt:new Date(String(data.get("starts"))).toISOString(),endsAt:new Date(String(data.get("ends"))).toISOString()});}catch{setError(c.invalidTime);}
 }
 function action(action:string,label:string,disabled=false){return <button type="button" className="btn secondary" disabled={busy||disabled} onClick={()=>{if(action!=="cancel"||window.confirm(c.confirmCancel))void patch({action});}}>{label}</button>;}
 return <article className="card grid">
  <div className="card-head"><div><strong>{appointmentTime(locale,row.starts_at)}</strong><p>{c.ends}: {appointmentTime(locale,row.ends_at)}</p></div><span className="badge">{appointmentState(locale,row.status)}</span></div>
  {row.applicant_name&&<p>{c.applicant}: <strong>{row.applicant_name}</strong></p>}
  <p>{c.staff}: {staff.find(s=>s.id===row.employee_id)?.display_name??c.unassigned}</p>
  {row.attendance!=="pending"&&<p>{c.attendanceLabel}: {appointmentState(locale,row.attendance)}</p>}
  {row.user_notes&&<p style={{whiteSpace:"pre-wrap"}}>{row.user_notes}</p>}
  <details><summary>{c.manage}</summary><div className="grid">
   {!closed&&row.attendance==="pending"&&<>
    <form className="grid" onSubmit={submitTime}><fieldset disabled={busy} className="appointment-fields"><p className="muted">{c.timeZone}: <bdi>{zone}</bdi></p><div className="form-grid two"><label>{c.starts}<input type="datetime-local" name="starts" required defaultValue={localDateTime(row.starts_at)}/></label><label>{c.ends}<input type="datetime-local" name="ends" required defaultValue={localDateTime(row.ends_at)}/></label></div><button className="btn secondary">{c.reschedule}</button>{error&&<p role="alert">{error}</p>}</fieldset></form>
    <form className="grid" onSubmit={e=>{e.preventDefault();void patch({action:"assign",employeeId:new FormData(e.currentTarget).get("employeeId")||null});}}><fieldset disabled={busy} className="appointment-fields"><StaffSelect locale={locale} staff={staff} value={row.employee_id}/><button className="btn secondary">{c.assign}</button></fieldset></form>
   </>}
   <form className="grid" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);void patch({action:"notes",userNotes:data.get("instructions"),internalNotes:data.get("notes")});}}><fieldset disabled={busy} className="appointment-fields"><label>{c.instructions}<textarea name="instructions" maxLength={2000} defaultValue={row.user_notes??""}/></label><label>{c.internalNotes}<textarea name="notes" maxLength={5000} defaultValue={row.internal_notes??""}/></label><button className="btn secondary">{c.saveNotes}</button></fieldset></form>
   {!closed&&<div className="form-actions">
    {row.status==="available"&&action("block",c.block)}{row.status==="blocked"&&action("open",c.open,started)}
    {row.status==="booked"&&<>{row.attendance==="pending"&&action("attend",c.attend,!started||!row.employee_id)}{action("complete",c.complete,row.attendance!=="attended")}{row.attendance==="pending"&&action("no_show",c.noShow,!ended||!row.employee_id)}</>}
    {row.attendance==="pending"&&action("cancel",c.cancel)}
   </div>}
  </div></details>
 </article>;
}
