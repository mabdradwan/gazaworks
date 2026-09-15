"use client";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type AnyRecord=Record<string,unknown>;

function JsonCard({item}:{item:AnyRecord}){return <div className="card"><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",margin:0,fontSize:13}}>{JSON.stringify(item,null,2)}</pre></div>}

export function PortfolioPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/portfolio");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:f.get("title"),description:f.get("description")})});setMessage(r.ok?"Portfolio item created.":"Could not create portfolio item.");if(r.ok){e.currentTarget.reset();await load()}}
  async function remove(id:string){if(!confirm("Delete this portfolio item?"))return;await fetch(`/api/portfolio?id=${id}`,{method:"DELETE"});await load()}
  async function upload(portfolioId:string,file:File){
    setMessage("Preparing upload…");
    const prep=await fetch("/api/portfolio/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolioId,fileName:file.name,mimeType:file.type,sizeBytes:file.size})});
    const p=await prep.json();if(!prep.ok){setMessage(p.error??"Upload rejected.");return}
    const db=supabaseBrowser();const {error}=await db.storage.from("portfolio").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
    if(error){setMessage(error.message);return}
    const save=await fetch("/api/portfolio/upload",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolioId,path:p.path,mimeType:file.type,sizeBytes:file.size,mediaType:p.mediaType})});
    setMessage(save.ok?"Media uploaded.":"Upload completed but media record could not be saved.");await load();
  }
  return <div className="grid">
    <form className="card grid" onSubmit={create}><h2>Add portfolio project</h2><label>Title<input name="title" required minLength={2}/></label><label>Description<textarea name="description" rows={4}/></label><button className="btn">Add project</button><p role="status">{message}</p></form>
    {items.length?items.map((raw)=>{
      const item=raw as {id:string;title?:string;description?:string;portfolio_media?:AnyRecord[]};
      return <div className="card grid" key={item.id}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><div><h2>{item.title}</h2><p className="muted">{item.description}</p></div><button className="btn secondary" onClick={()=>remove(item.id)}>Delete</button></div><label>Add image or video<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(item.id,file)}}/></label><div className="grid">{(item.portfolio_media??[]).map((m,i)=><JsonCard key={i} item={m}/>)}</div></div>
    }):<div className="empty">No portfolio projects yet.</div>}
  </div>
}

export function OffersPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/offers");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/offers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId:f.get("workRequestId"),priceMinor:Number(f.get("priceMinor")),currency:f.get("currency"),deliveryDays:Number(f.get("deliveryDays")),proposal:f.get("proposal"),scope:f.get("scope")})});setMessage(r.ok?"Offer submitted.":"Offer could not be submitted.");if(r.ok){e.currentTarget.reset();await load()}}
  async function accept(id:string){const r=await fetch("/api/offers/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offerId:id})});setMessage(r.ok?"Offer accepted; project created and awaiting payment.":"You can only accept offers on your own work requests.");if(r.ok)await load()}
  return <div className="grid">
    <form className="card grid" onSubmit={submit}><h2>Submit an offer</h2><label>Work request ID<input name="workRequestId" required/></label><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))"}}><label>Price (minor units)<input name="priceMinor" type="number" min="1" required/></label><label>Currency<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option></select></label><label>Delivery days<input name="deliveryDays" type="number" min="1" max="365" required/></label></div><label>Proposal<textarea name="proposal" minLength={10} rows={4} required/></label><label>Scope<textarea name="scope" minLength={5} rows={4} required/></label><button className="btn">Submit private offer</button><p role="status">{message}</p></form>
    {items.length?items.map((x,i)=><div className="card" key={String(x.id??i)}><JsonCard item={x}/><button className="btn secondary" style={{marginTop:12}} onClick={()=>accept(String(x.id))}>Accept this offer</button></div>):<div className="empty">No offers visible to this account yet.</div>}
  </div>
}

export function ProjectsPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/projects");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function fund(id:string){const r=await fetch("/api/payments/mock-fund",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,providerFeeMinor:0})});const data=await r.json();setMessage(r.ok?"Development payment simulated. This is not a real charge.":data.error??"Could not fund.");if(r.ok)await load()}
  async function deliver(id:string){const text=prompt("Describe the final delivery");if(!text)return;const r=await fetch("/api/projects/deliveries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,message:text})});setMessage(r.ok?"Delivery submitted.":"Delivery requires a funded project and the talent account.");if(r.ok)await load()}
  async function review(id:string,action:"accept"|"request_revision"){const r=await fetch("/api/projects/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,action})});setMessage(r.ok?(action==="accept"?"Delivery accepted; payout pending.":"Revision requested."):"This action is only available to the client when a delivery is pending.");if(r.ok)await load()}
  return <div className="grid"><p role="status">{message}</p>{items.length?items.map((x,i)=><div className="card grid" key={String(x.id??i)}><JsonCard item={x}/><div className="form-actions"><button className="btn" onClick={()=>fund(String(x.id))}>Simulate funding (development)</button><button className="btn secondary" onClick={()=>deliver(String(x.id))}>Submit delivery</button><button className="btn secondary" onClick={()=>review(String(x.id),"accept")}>Accept delivery</button><button className="btn secondary" onClick={()=>review(String(x.id),"request_revision")}>Request revision</button></div></div>):<div className="empty">No projects yet.</div>}</div>
}

export function DisputesPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/disputes");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function open(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/disputes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:f.get("projectId"),reason:f.get("reason")})});setMessage(r.ok?"Dispute opened; funds are frozen.":"Could not open dispute.");if(r.ok){e.currentTarget.reset();await load()}}
  async function appeal(id:string){const reasoning=prompt("Add new evidence or reasoning for the single appeal");if(!reasoning)return;const r=await fetch("/api/appeals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({disputeId:id,reasoning})});setMessage(r.ok?"Appeal submitted.":"Appeal unavailable, already used, or outside the 12-hour window.");if(r.ok)await load()}
  return <div className="grid"><form className="card grid" onSubmit={open}><h2>Open dispute</h2><label>Project ID<input name="projectId" required/></label><label>Reason<textarea name="reason" minLength={10} rows={5} required/></label><button className="btn">Open dispute</button><p role="status">{message}</p></form>{items.length?items.map((x,i)=><div className="card grid" key={String(x.id??i)}><JsonCard item={x}/><button className="btn secondary" onClick={()=>appeal(String(x.id))}>Submit one appeal</button></div>):<div className="empty">No disputes.</div>}</div>
}

export function ReviewsPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/reviews");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const val=(k:string)=>Number(f.get(k));const r=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:f.get("projectId"),subjectId:f.get("subjectId"),communication:val("communication"),professionalism:val("professionalism"),overall:val("overall"),feedback:f.get("feedback")})});setMessage(r.ok?"Review submitted.":"Reviews are available only for completed projects.");if(r.ok){e.currentTarget.reset();await load()}}
  return <div className="grid"><form className="card grid" onSubmit={submit}><h2>Leave a review</h2><label>Project ID<input name="projectId" required/></label><label>Profile being reviewed<input name="subjectId" required/></label><div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>{["communication","professionalism","overall"].map(k=><label key={k}>{k}<select name={k} defaultValue="5">{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</select></label>)}</div><label>Feedback<textarea name="feedback" rows={4}/></label><button className="btn">Submit review</button><p role="status">{message}</p></form>{items.length?items.map((x,i)=><JsonCard key={i} item={x}/>):<div className="empty">No reviews yet.</div>}</div>
}

export function PaymentsPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]);
  useEffect(()=>{void fetch("/api/payments").then(async r=>{if(r.ok)setItems(await r.json())})},[]);
  return <div className="grid"><div className="card"><h2>Transaction ledger</h2><p className="muted">The 7% total deduction is recorded deterministically. Mock transactions are explicitly labeled and are not real payments.</p></div>{items.length?items.map((x,i)=><JsonCard key={i} item={x}/>):<div className="empty">No transactions yet.</div>}</div>
}

export function NotificationsPanel(){
  const [items,setItems]=useState<AnyRecord[]>([]);
  async function load(){const r=await fetch("/api/notifications");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function read(id:string){await fetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});await load()}
  return <div className="grid">{items.length?items.map((x,i)=><div className="card" key={String(x.id??i)}><strong>{String(x.title??"Notification")}</strong><p>{String(x.body??"")}</p><small className="muted">{String(x.category??"")}</small>{!x.read_at&&<div style={{marginTop:10}}><button className="btn secondary" onClick={()=>read(String(x.id))}>Mark read</button></div>}</div>):<div className="empty">No notifications.</div>}</div>
}

export function MessagesPanel(){
  const [rooms,setRooms]=useState<AnyRecord[]>([]),[room,setRoom]=useState<string|null>(null),[messages,setMessages]=useState<AnyRecord[]>([]),[notice,setNotice]=useState("");
  async function loadRooms(){const r=await fetch("/api/messages/rooms");if(r.ok){const d=await r.json();setRooms(d);if(!room&&d[0]?.room_id)setRoom(d[0].room_id)}}
  async function loadMessages(id:string){const r=await fetch(`/api/messages?roomId=${id}`);if(r.ok)setMessages(await r.json())}
  useEffect(()=>{void loadRooms()},[]);
  useEffect(()=>{
    if(!room)return;
    void loadMessages(room);
    const db=supabaseBrowser();
    const channel=db.channel("room-"+room).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:"room_id=eq."+room},()=>{void loadMessages(room)}).subscribe();
    return()=>{void db.removeChannel(channel)};
  },[room]);
  async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!room)return;const f=new FormData(e.currentTarget),body=String(f.get("body")??"");const r=await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,body})});const d=await r.json();setNotice(d.notice??(r.ok?"Sent.":"Could not send."));if(r.ok){e.currentTarget.reset();await loadMessages(room)}}
  async function upload(file:File){
    if(!room)return;
    setNotice("Preparing attachment…");
    const prep=await fetch("/api/messages/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,fileName:file.name,mimeType:file.type,sizeBytes:file.size})});
    const p=await prep.json();if(!prep.ok){setNotice(p.error??"Attachment rejected.");return}
    const db=supabaseBrowser();const {error}=await db.storage.from("message-files").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
    if(error){setNotice(error.message);return}
    const done=await fetch("/api/messages/upload",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:room,path:p.path,mimeType:file.type})});
    setNotice(done.ok?"Attachment sent.":"Attachment upload could not be recorded.");if(done.ok)await loadMessages(room);
  }
  return <div className="grid" style={{gridTemplateColumns:"minmax(200px,.35fr) minmax(320px,1fr)"}}><div className="card"><h2>Conversations</h2>{rooms.length?rooms.map((x,i)=><button className="btn secondary" style={{width:"100%",marginBottom:8}} key={i} onClick={()=>setRoom(String(x.room_id))}>Project room {i+1}</button>):<div className="empty">No project conversations.</div>}</div><div className="card grid"><div style={{maxHeight:480,overflow:"auto"}}>{messages.map((x,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid var(--line)",opacity:x.status==="pending_moderation"?.65:1}}><strong>Message</strong><div>{String(x.body??"")}</div><small className="muted">{String(x.status??"")} · {new Date(String(x.created_at)).toLocaleString()}</small></div>)}</div>{room?<form className="grid" onSubmit={send}><label>Message<textarea name="body" required rows={3}/></label><button className="btn">Send inside GazaWorks</button><label>Image, PDF, or voice/audio attachment<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/webm,audio/ogg" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file)}}/></label><p role="status">{notice}</p></form>:<div className="empty">Select a conversation.</div>}</div></div>
}
