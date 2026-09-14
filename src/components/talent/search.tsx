"use client";
import {FormEvent,useEffect,useState} from "react";

type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type Talent={
  id:string;account_type:"individual"|"team";display_name:string;rating?:number|null;review_count?:number;
  individual_profiles?:{professional_title?:string;bio?:string;availability?:string;years_experience?:number;hourly_rate_minor?:number;currency?:string;verification_status:string}|null;
  team_profiles?:{team_name?:string;description?:string;team_size?:number;rate_minor?:number;currency?:string;verification_status:string}|null;
};

export function TalentSearch(){
  const [items,setItems]=useState<Talent[]>([]);
  const [skills,setSkills]=useState<Skill[]>([]);
  const [state,setState]=useState("Search verified GazaWorks professionals and teams.");
  const [notice,setNotice]=useState("");
  useEffect(()=>{void fetch("/api/taxonomy").then(async r=>{if(r.ok)setSkills((await r.json()).skills??[])})},[]);
  async function search(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setState("Searching…");setNotice("");
    const f=new FormData(e.currentTarget);
    const params=new URLSearchParams({q:String(f.get("q")??""),type:String(f.get("type")??""),skillId:String(f.get("skillId")??""),minExperience:String(f.get("minExperience")??""),maxRate:String(f.get("maxRate")??"")});
    const r=await fetch("/api/talent?"+params.toString());
    if(!r.ok){setItems([]);setState(r.status===401?"Sign in to access detailed talent profiles.":"Search is temporarily unavailable.");return}
    const rows=await r.json();setItems(rows);setState(rows.length?"":"No verified talent matched these filters.");
  }
  async function save(id:string){
    const r=await fetch("/api/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({talentId:id})});
    setNotice(r.ok?"Saved to favorites.":"Only client accounts can save talent.");
  }
  return <>
    <form className="card grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}} onSubmit={search}>
      <label>Profession or name<input name="q"/></label>
      <label>Talent type<select name="type"><option value="">Individuals and teams</option><option value="individual">Individuals</option><option value="team">Teams</option></select></label>
      <label>Skill<select name="skillId"><option value="">Any skill</option>{skills.map(s=><option key={s.id} value={s.id}>{s.skill_translations.find(t=>t.locale==="en")?.name??s.slug}</option>)}</select></label>
      <label>Minimum experience<input name="minExperience" type="number" min="0" max="80"/></label>
      <label>Max rate (minor units)<input name="maxRate" type="number" min="0"/></label>
      <button className="btn" style={{alignSelf:"end"}}>Search</button>
    </form>
    {notice&&<p role="status">{notice}</p>}
    {state&&<div className="empty" style={{marginTop:24}}>{state}</div>}
    <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",marginTop:24}}>
      {items.map(x=>{
        const ind=Array.isArray(x.individual_profiles)?x.individual_profiles[0]:x.individual_profiles;
        const team=Array.isArray(x.team_profiles)?x.team_profiles[0]:x.team_profiles;
        const exp=ind?.years_experience!==undefined?String(ind.years_experience)+" years experience · ":"";
        const price=ind?.hourly_rate_minor?String(ind.hourly_rate_minor)+" "+(ind.currency??""):team?.rate_minor?String(team.rate_minor)+" "+(team.currency??""):"Price by offer";
        return <article className="card" key={x.id}>
          <span className="badge">✓ Verified {x.account_type}</span>
          <h2>{x.display_name}</h2>
          <strong>{ind?.professional_title??team?.team_name}</strong>
          <p className="muted">{ind?.bio??team?.description??"Profile details available after direct invitation."}</p>
          <p><strong>{x.rating??"New"}</strong>{x.review_count?" ("+x.review_count+" reviews)":""}</p>
          <p className="muted">{exp}{price}</p>
          <button className="btn secondary" onClick={()=>void save(x.id)}>Save talent</button>
        </article>
      })}
    </div>
  </>
}
