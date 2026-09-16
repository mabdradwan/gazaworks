"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {appointmentCopy,appointmentError,appointmentState,appointmentTime} from "@/lib/appointment-copy";
import type {Appointment} from "@/domain/appointments";

type Verification={id:string;status:string;decision_reason:string|null}|null;
export function VerificationFlow({locale="en"}:{locale?:string}){
 const c=appointmentCopy(locale),[verification,setVerification]=useState<Verification>(null),[slots,setSlots]=useState<Appointment[]>([]),[bookings,setBookings]=useState<Appointment[]>([]);
 const [message,setMessage]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[loadError,setLoadError]=useState(false);
 const generation=useRef(0),writing=useRef(false);
 const load=useCallback(async()=>{
  const current=++generation.current;setLoading(true);
  const [v,a]=await Promise.all([apiFetch("/api/verification"),apiFetch("/api/appointments")]);
  const [request,appointments]=await Promise.all([v.json(),a.json()]);
  if(current!==generation.current)return;
  if(v.ok&&a.ok){setVerification(request);setSlots(appointments.available);setBookings(appointments.bookings);setLoadError(false);}
  else setLoadError(true);
  setLoading(false);
 },[]);
 useEffect(()=>{void load();return()=>{generation.current+=1;};},[load]);
 async function mutate(url:string,method:string,body:Record<string,unknown>|undefined,success:string){
  if(writing.current)return;
  writing.current=true;setBusy(true);setMessage("");
  try{
   const response=await apiFetch(url,{method,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined}),data=await response.json();
   setMessage(response.ok?success:appointmentError(locale,data.error));
   await load();
  }finally{writing.current=false;setBusy(false);}
 }
 const canRequest=!verification||["rejected","changes_requested"].includes(verification.status);
 const canBook=verification&&["requested","under_review","interview_required","pending"].includes(verification.status)&&!bookings.some(b=>b.status==="booked");
 return <div className="grid">
  <section className="card grid"><div className="card-head"><h2>{c.statusTitle}</h2><button className="btn secondary" disabled={loading||busy} onClick={()=>void load()}>{c.refresh}</button></div>
   {loading?<p role="status">{c.loading}</p>:loadError?<p role="alert">{c.loadFailed}</p>:<>
    {verification?<span className="badge">{appointmentState(locale,verification.status)}</span>:<p>{c.none}</p>}
    {verification?.decision_reason&&<div><h3>{c.decision}</h3><p style={{whiteSpace:"pre-wrap"}}>{verification.decision_reason}</p></div>}
    <button className="btn" disabled={busy||!canRequest} onClick={()=>void mutate("/api/verification","POST",undefined,c.requestSent)}>{c.request}</button>
   </>}
   {message&&<p role="status">{message}</p>}
  </section>
  {!loading&&!loadError&&<>
   <section className="card grid"><h2>{c.myBookings}</h2><p className="muted">{c.gazaTime}</p>
    {bookings.length?bookings.map(a=><article className="card grid" key={a.id}><div className="card-head"><strong>{appointmentTime(locale,a.starts_at)}</strong><span className="badge">{appointmentState(locale,a.status)}</span></div><p>{c.ends}: {appointmentTime(locale,a.ends_at)}</p>{a.user_notes&&<p style={{whiteSpace:"pre-wrap"}}>{a.user_notes}</p>}{a.attendance!=="pending"&&<p>{c.attendanceLabel}: {appointmentState(locale,a.attendance)}</p>}{a.status==="booked"&&new Date(a.starts_at).getTime()>Date.now()&&<button className="btn secondary" disabled={busy} onClick={()=>{if(window.confirm(c.confirmCancel))void mutate("/api/appointments","PATCH",{appointmentId:a.id,version:a.version},c.cancelled);}}>{c.cancel}</button>}</article>):<p className="empty">{c.emptyHistory}</p>}
   </section>
   {canBook&&<section className="card grid"><h2>{c.available}</h2><p className="muted">{c.gazaTime}</p>{slots.length?slots.map(a=><article className="card grid" key={a.id}><strong>{appointmentTime(locale,a.starts_at)}</strong><p>{c.ends}: {appointmentTime(locale,a.ends_at)}</p>{a.user_notes&&<p style={{whiteSpace:"pre-wrap"}}>{a.user_notes}</p>}<button className="btn secondary" disabled={busy} onClick={()=>void mutate("/api/appointments","POST",{appointmentId:a.id,requestId:verification.id},c.booked)}>{c.book}</button></article>):<p className="empty">{c.emptySlots}</p>}</section>}
  </>}
 </div>;
}
