"use client";
import {FormEvent,useState} from "react";
export function AIAssistant({locale="en",mode="faq"}:{locale?:string;mode?:"faq"|"talent_search"}){
  const [text,setText]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget),prompt=String(f.get("prompt")??"");
    const endpoint=mode==="talent_search"?"/api/ai/talent-search":"/api/ai";
    const body=mode==="talent_search"?{prompt,locale}:{task:"faq",prompt,locale};
    const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();setText(r.ok?d.text:(d.error==="service_unavailable"?"AI provider is not connected yet.":"Could not answer this request."));setBusy(false);
  }
  return <form className="card grid" onSubmit={submit}><div><span className="badge">GazaWorks AI</span><h2>{mode==="talent_search"?"Find the right Gaza talent":"Platform assistant"}</h2><p className="muted">{mode==="talent_search"?"Describe the skills and type of professional or team you need. Recommendations are grounded only in verified GazaWorks database records.":"Ask how GazaWorks works, how to improve a profile, or how to use a platform feature."}</p></div><label>Your request<textarea name="prompt" required minLength={5} rows={4}/></label><button className="btn" disabled={busy}>{busy?"Working…":"Ask GazaWorks AI"}</button>{text&&<div className="card" style={{whiteSpace:"pre-wrap"}}>{text}</div>}</form>
}
