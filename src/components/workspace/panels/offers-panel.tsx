"use client";
import {FormEvent,useEffect,useState} from "react";

type Profile={id:string;account_type:"individual"|"team"|"client"};
type Request={id:string;client_id:string;title:string;description:string;budget_min_minor:number;budget_max_minor:number;currency:string;visibility:string;status:string;created_at:string};
type Offer={id:string;work_request_id:string;talent_id:string;price_minor:number;currency:string;delivery_days:number;proposal:string;scope:string;status:string;created_at:string;profiles?:{display_name?:string;account_type?:string}|null};

export function OffersPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[me,setMe]=useState<Profile|null>(null),[requests,setRequests]=useState<Request[]>([]),[offers,setOffers]=useState<Offer[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  async function load(){const p=await fetch("/api/profile");if(p.ok){const profile=await p.json();setMe(profile);const [r,o]=await Promise.all([fetch(profile.account_type==="client"?"/api/work-requests?mine=1":"/api/work-requests"),fetch("/api/offers")]);if(r.ok)setRequests(await r.json());if(o.ok)setOffers(await o.json())}}
  useEffect(()=>{void load()},[]);

  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget);const r=await fetch("/api/offers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId:f.get("workRequestId"),priceMinor:Math.round(Number(f.get("price"))*100),currency:f.get("currency"),deliveryDays:Number(f.get("deliveryDays")),proposal:f.get("proposal"),scope:f.get("scope")})});setMessage(r.ok?(ar?"تم إرسال العرض بشكل خاص للعميل.":"Private offer submitted to the client."):(ar?"تعذّر إرسال العرض. تأكد أن الطلب متاح لك ولم ترسل عرضًا سابقًا.":"Offer could not be submitted."));if(r.ok){e.currentTarget.reset();await load()}setBusy(false)}

  async function accept(id:string){if(!confirm(ar?"قبول هذا العرض وإنشاء اتفاقية مشروع؟":"Accept this offer and create the project agreement?"))return;const r=await fetch("/api/offers/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offerId:id})});setMessage(r.ok?(ar?"تم قبول العرض وإنشاء المشروع. يجب تمويل المشروع قبل بدء العمل.":"Offer accepted; project created and awaiting payment."):(ar?"تعذّر قبول العرض.":"Could not accept this offer."));if(r.ok)await load()}

  const requestTitle=(id:string)=>requests.find(x=>x.id===id)?.title??id;
  return <div className="grid">
    {me&&me.account_type!=="client"&&<form className="card grid" onSubmit={submit}>
      <div><h2>{ar?"إرسال عرض خاص":"Submit a private offer"}</h2><p className="muted">{ar?"لا يمكن للمحترفين الآخرين رؤية سعرك أو تفاصيل عرضك.":"Other professionals cannot see your price or proposal."}</p></div>
      <label>{ar?"طلب العمل":"Work request"}<select name="workRequestId" required><option value="">{ar?"اختر طلبًا":"Choose request"}</option>{requests.map(r=><option key={r.id} value={r.id}>{r.title} · {new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:r.currency}).format(r.budget_min_minor/100)}–{new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:r.currency}).format(r.budget_max_minor/100)}</option>)}</select></label>
      <div className="form-grid three"><label>{ar?"السعر المقترح":"Proposed price"}<input name="price" type="number" step="0.01" min="0.01" required/></label><label>{ar?"العملة":"Currency"}<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label><label>{ar?"مدة التسليم بالأيام":"Delivery days"}<input name="deliveryDays" type="number" min="1" max="365" required/></label></div>
      <label>{ar?"رسالة العرض":"Proposal message"}<textarea name="proposal" minLength={10} rows={5} required/></label>
      <label>{ar?"نطاق العمل":"Scope summary"}<textarea name="scope" minLength={5} rows={5} required/></label>
      <button className="btn" disabled={busy}>{busy?(ar?"جارٍ الإرسال…":"Submitting…"):(ar?"إرسال العرض":"Submit private offer")}</button>
    </form>}

    {message&&<p role="status">{message}</p>}
    <div className="grid"><h2>{me?.account_type==="client"?(ar?"العروض المستلمة":"Offers received"):(ar?"عروضي":"My offers")}</h2>
      {offers.length?offers.map(o=><article className="card offer-card" key={o.id}><div className="card-head"><div><span className="badge">{o.status}</span><h3>{requestTitle(o.work_request_id)}</h3>{me?.account_type==="client"&&<p className="muted">{o.profiles?.display_name??(ar?"محترف موثّق":"Verified talent")}</p>}</div><strong>{new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:o.currency}).format(o.price_minor/100)}</strong></div><div className="meta-grid"><span>{ar?"التسليم":"Delivery"}: <strong>{o.delivery_days} {ar?"يوم":"days"}</strong></span><span>{ar?"أرسل في":"Submitted"}: {new Date(o.created_at).toLocaleDateString(ar?"ar-PS":"en")}</span></div><h4>{ar?"نطاق العمل":"Scope"}</h4><p>{o.scope}</p><h4>{ar?"الرسالة":"Proposal"}</h4><p className="muted">{o.proposal}</p>{me?.account_type==="client"&&o.status==="submitted"&&<button className="btn" onClick={()=>void accept(o.id)}>{ar?"قبول العرض":"Accept offer"}</button>}</article>):<div className="empty">{ar?"لا توجد عروض بعد.":"No offers yet."}</div>}
    </div>
  </div>
}
