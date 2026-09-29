"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
import {basicWorkspaceCopy} from "@/lib/basic-workspace-copy";

type Login={id:string;provider:string;success:boolean;user_agent?:string|null;device_hash?:string|null;metadata?:{newDevice?:boolean}|null;created_at:string};

function browserName(ua:string,fallback:string){
  if(/Edg\//.test(ua))return "Edge";
  if(/Chrome\//.test(ua))return "Chrome";
  if(/Safari\//.test(ua)&&!/Chrome\//.test(ua))return "Safari";
  if(/Firefox\//.test(ua))return "Firefox";
  return fallback;
}

export function SecurityHistory({locale="en"}:{locale?:string}){
  const {security:c,language}=basicWorkspaceCopy(locale),[rows,setRows]=useState<Login[]>([]),[message,setMessage]=useState("");
  useEffect(()=>{void apiFetch("/api/security/history").then(async r=>{if(r.ok)setRows(await r.json());else setMessage(c.loadFailed)})},[c.loadFailed]);
  return <div className="grid">
    <div className="card"><h2>{c.title}</h2><p className="muted">{c.description}</p></div>
    {message&&<p role="status">{message}</p>}
    {rows.length?<div className="card document-list">{rows.map(x=><div className="document-row" key={x.id}><div><strong>{browserName(x.user_agent??"",c.browser)} · {x.provider}</strong><small className="muted">{new Date(x.created_at).toLocaleString(language)}</small></div><span className={"status-chip "+(x.metadata?.newDevice?"warning-chip":"success-chip")}>{x.metadata?.newDevice?c.newDevice:c.signIn}</span></div>)}</div>:<div className="empty">{c.empty}</div>}
  </div>
}
