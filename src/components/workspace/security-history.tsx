"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";

type Login={id:string;provider:string;success:boolean;user_agent?:string|null;device_hash?:string|null;metadata?:{newDevice?:boolean}|null;created_at:string};

function browserName(ua:string){
  if(/Edg\//.test(ua))return "Edge";
  if(/Chrome\//.test(ua))return "Chrome";
  if(/Safari\//.test(ua)&&!/Chrome\//.test(ua))return "Safari";
  if(/Firefox\//.test(ua))return "Firefox";
  return "Browser";
}

export function SecurityHistory({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[rows,setRows]=useState<Login[]>([]),[message,setMessage]=useState("");
  useEffect(()=>{void apiFetch("/api/security/history").then(async r=>{if(r.ok)setRows(await r.json());else setMessage(ar?"تعذّر تحميل سجل تسجيل الدخول.":"Could not load login history.")})},[ar]);
  return <div className="grid">
    <div className="card"><h2>{ar?"أمان الحساب":"Account security"}</h2><p className="muted">{ar?"يعرض GazaWorks آخر عمليات تسجيل الدخول ويضيف تنبيهًا عند اكتشاف متصفح أو جهاز جديد. لا يتم عرض عنوان IP الخام.":"GazaWorks records recent sign-ins and raises an alert for a new browser/device. Raw IP addresses are not displayed."}</p></div>
    {message&&<p role="status">{message}</p>}
    {rows.length?<div className="card document-list">{rows.map(x=><div className="document-row" key={x.id}><div><strong>{browserName(x.user_agent??"")} · {x.provider}</strong><small className="muted">{new Date(x.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div><span className={"status-chip "+(x.metadata?.newDevice?"warning-chip":"success-chip")}>{x.metadata?.newDevice?(ar?"جهاز جديد":"New device"):(ar?"تسجيل دخول":"Sign-in")}</span></div>)}</div>:<div className="empty">{ar?"لا يوجد سجل تسجيل دخول بعد.":"No login history yet."}</div>}
  </div>
}

