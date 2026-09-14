"use client";
import {FormEvent,useEffect,useState} from "react";

type Category={id:string;slug:string;category_translations:{locale:string;name:string}[]};
type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type RequestRow={id:string;title:string;description:string;budget_min_minor:number;budget_max_minor:number;currency:string;status:string;visibility:string;created_at:string};

export function WorkRequestForm(){
  const [message,setMessage]=useState("");
  const [categories,setCategories]=useState<Category[]>([]);
  const [skills,setSkills]=useState<Skill[]>([]);
  const [requests,setRequests]=useState<RequestRow[]>([]);
  async function load(){
    const [t,r]=await Promise.all([fetch("/api/taxonomy"),fetch("/api/work-requests")]);
    if(t.ok){const x=await t.json();setCategories(x.categories??[]);setSkills(x.skills??[])}
    if(r.ok)setRequests(await r.json());
  }
  useEffect(()=>{void load()},[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setMessage("Publishing…");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/work-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      title:f.get("title"),description:f.get("description"),categoryId:f.get("categoryId"),
      skills:f.getAll("skills"),budgetMin:Number(f.get("budgetMin")),budgetMax:Number(f.get("budgetMax")),
      currency:f.get("currency"),visibility:f.get("visibility"),deliveryExpectations:f.get("deliveryExpectations"),notes:f.get("notes")
    })});
    setMessage(r.ok?"Work request published.":"Could not publish. Sign in as a client and check the fields.");
    if(r.ok){e.currentTarget.reset();await load()}
  }
  return <div className="grid">
    <form className="card grid" onSubmit={submit}>
      <label>Title<input name="title" required minLength={5}/></label>
      <label>Description<textarea name="description" required minLength={30} rows={7}/></label>
      <label>Category<select name="categoryId" required><option value="">Choose category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.category_translations.find(t=>t.locale==="en")?.name??c.slug}</option>)}</select></label>
      <fieldset className="card"><legend>Skills</legend><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>{skills.map(s=><label key={s.id} style={{display:"flex",alignItems:"center",gap:8,fontWeight:400}}><input style={{width:"auto"}} type="checkbox" name="skills" value={s.id}/>{s.skill_translations.find(t=>t.locale==="en")?.name??s.slug}</label>)}</div></fieldset>
      <div className="grid" style={{gridTemplateColumns:"repeat(2,1fr)"}}><label>Minimum budget (minor units)<input name="budgetMin" type="number" min="1" required/></label><label>Maximum budget (minor units)<input name="budgetMax" type="number" min="1" required/></label></div>
      <label>Currency<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option></select></label>
      <label>Delivery expectations<textarea name="deliveryExpectations" rows={3}/></label>
      <label>Additional notes<textarea name="notes" rows={3}/></label>
      <label>Visibility<select name="visibility"><option value="public">Relevant verified talent</option><option value="invite_only">Private invitations only</option></select></label>
      <button className="btn">Publish work request</button><p role="status">{message}</p>
    </form>
    <div className="grid"><h2>Available work requests</h2>{requests.length?requests.map(x=><article className="card" key={x.id}><span className="badge">{x.status}</span><h3>{x.title}</h3><p className="muted">{x.description}</p><p><strong>{x.budget_min_minor}–{x.budget_max_minor} {x.currency}</strong></p><code>{x.id}</code></article>):<div className="empty">No published work requests visible to this account.</div>}</div>
  </div>
}
