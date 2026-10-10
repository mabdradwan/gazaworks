"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {appointmentCopy,appointmentError,appointmentState} from "@/lib/appointment-copy";

type Verification={id:string;status:string;decision_reason:string|null}|null;
export function VerificationFlow({locale="en"}:{locale?:string}){
 const c=appointmentCopy(locale),[verification,setVerification]=useState<Verification>(null);
 const [message,setMessage]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[loadError,setLoadError]=useState(false);
 const generation=useRef(0),writing=useRef(false);
 const load=useCallback(async()=>{
  const current=++generation.current;setLoading(true);
  const v=await apiFetch("/api/verification");
  const request=await v.json();
  if(current!==generation.current)return;
  if(v.ok){setVerification(request);setLoadError(false);}
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
 return <div className="grid">
  <section className="card grid"><div className="card-head"><h2>{c.statusTitle}</h2><button className="btn secondary" disabled={loading||busy} onClick={()=>void load()}>{c.refresh}</button></div>
   {loading?<p role="status">{c.loading}</p>:loadError?<p role="alert">{c.loadFailed}</p>:<>
    {verification?<span className="badge">{appointmentState(locale,verification.status==="verified"?"verified":verification.status==="rejected"?"rejected":"under_review")}</span>:<p>{c.none}</p>}
    {verification?.decision_reason&&<div><h3>{c.decision}</h3><p style={{whiteSpace:"pre-wrap"}}>{verification.decision_reason}</p></div>}
    <button className="btn" disabled={busy||!canRequest} onClick={()=>void mutate("/api/verification","POST",undefined,c.requestSent)}>{c.request}</button>
   </>}
   {message&&<p role="status">{message}</p>}
  </section>
 </div>;
}
