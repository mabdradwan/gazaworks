"use client";
import {FormEvent,useState} from "react";

export function TalentActions({talentId,locale="en"}:{talentId:string;locale?:string}){
  const ar=locale==="ar",[open,setOpen]=useState(false),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  async function save(){const r=await fetch("/api/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({talentId})});setMessage(r.ok?(ar?"تم الحفظ في المفضلة.":"Saved to favorites."):(ar?"الحفظ متاح لحسابات العملاء فقط.":"Only client accounts can save talent."))}
  async function hire(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const f=new FormData(e.currentTarget),budget=String(f.get("budget")??"").trim();
    const body={talentId,title:f.get("title"),description:f.get("description"),budgetMinor:budget?Math.round(Number(budget)*100):undefined,currency:f.get("currency"),desiredDeliveryAt:f.get("delivery")?new Date(String(f.get("delivery"))).toISOString():undefined};
    const r=await fetch("/api/direct-hire",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));
    setMessage(r.ok?(ar?"تم إرسال طلب العمل الخاص. سيصل للمحترف داخل GazaWorks.":"Private work request sent inside GazaWorks."):(d.error??(ar?"تعذّر إرسال الطلب. تأكد أنك تستخدم حساب عميل.":"Could not send request. Use a client account.")));
    if(r.ok){e.currentTarget.reset();setOpen(false)}setBusy(false);
  }
  return <div className="grid" style={{gap:10}}>
    <div className="form-actions"><button className="btn secondary" onClick={()=>void save()}>{ar?"حفظ":"Save"}</button><button className="btn" onClick={()=>setOpen(v=>!v)}>{ar?"توظيف / إرسال طلب عمل":"Hire / Send work request"}</button></div>
    {open&&<form className="card grid direct-hire-form" onSubmit={hire}>
      <h3>{ar?"إرسال طلب عمل خاص":"Send a private work request"}</h3>
      <label>{ar?"عنوان المهمة":"Project title"}<input name="title" minLength={5} required/></label>
      <label>{ar?"التفاصيل":"Details"}<textarea name="description" rows={6} minLength={20} required/></label>
      <div className="form-grid two"><label>{ar?"الميزانية المقترحة (اختياري)":"Proposed budget (optional)"}<input name="budget" type="number" min="0.01" step="0.01"/></label><label>{ar?"العملة":"Currency"}<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label></div>
      <label>{ar?"تاريخ التسليم المطلوب (اختياري)":"Desired delivery date (optional)"}<input name="delivery" type="date"/></label>
      <button className="btn" disabled={busy}>{busy?(ar?"جارٍ الإرسال…":"Sending…"):(ar?"إرسال داخل GazaWorks":"Send inside GazaWorks")}</button>
    </form>}
    {message&&<p role="status">{message}</p>}
  </div>
}
