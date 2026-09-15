"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";

type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type Data={
  account_type:"individual"|"team"|"client";
  display_name:string;
  onboarding_complete:boolean;
  individual_profiles?:Record<string,unknown>;
  team_profiles?:Record<string,unknown>;
  client_profiles?:Record<string,unknown>;
  profile_skills?:{skill_id:string;level:number}[];
};

const lines=(value:unknown)=>Array.isArray(value)?value.map(String).join("\n"):"";
const csv=(value:unknown)=>Array.isArray(value)?value.map(String).join(", "):"";
const parseLines=(value:FormDataEntryValue|null)=>String(value??"").split("\n").map(x=>x.trim()).filter(Boolean);
const parseCsv=(value:FormDataEntryValue|null)=>String(value??"").split(",").map(x=>x.trim()).filter(Boolean);

export function ProfileForm({locale="en"}:{locale?:string}){
  const [data,setData]=useState<Data|null>(null);
  const [skills,setSkills]=useState<Skill[]>([]);
  const [notice,setNotice]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    void Promise.all([fetch("/api/profile"),fetch("/api/taxonomy")]).then(async([p,t])=>{
      if(!p.ok)throw Error("Sign in to manage your profile");
      setData(await p.json());
      if(t.ok){const x=await t.json();setSkills(x.skills??[])}
    }).catch(e=>setNotice(e instanceof Error?e.message:"Could not load profile")).finally(()=>setLoading(false));
  },[]);

  const selected=useMemo(()=>new Set((data?.profile_skills??[]).map(x=>x.skill_id)),[data]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setNotice("Saving…");
    const f=new FormData(e.currentTarget);
    const num=(k:string)=>{const v=String(f.get(k)??"").trim();return v?Number(v):undefined};
    const body={
      displayName:String(f.get("displayName")??""),
      professionalTitle:String(f.get("professionalTitle")??"")||undefined,
      bio:String(f.get("bio")??"")||undefined,
      location:String(f.get("location")??"")||undefined,
      availability:String(f.get("availability")??"")||undefined,
      yearsExperience:num("yearsExperience"),
      legalName:String(f.get("legalName")??"")||undefined,
      phonePrivate:String(f.get("phonePrivate")??"")||undefined,
      emailPrivate:String(f.get("emailPrivate")??"")||undefined,
      hourlyRateMinor:num("hourlyRateMinor"),
      teamRateMinor:num("teamRateMinor"),
      currency:String(f.get("currency")??"USD"),
      languages:parseCsv(f.get("languages")),
      tools:parseCsv(f.get("tools")),
      education:parseLines(f.get("education")),
      experience:parseLines(f.get("experience")),
      skillIds:f.getAll("skillIds").map(String),
      countryCode:String(f.get("countryCode")??"")||undefined,
      companyName:String(f.get("companyName")??"")||undefined,
      organizationType:String(f.get("organizationType")??"")||undefined,
      teamSize:num("teamSize"),
      services:parseCsv(f.get("services")),
      expertise:parseCsv(f.get("expertise")),
      achievements:String(f.get("achievements")??"")||undefined,
      representativePrivate:String(f.get("representativePrivate")??"")||undefined,
      contactPrivate:String(f.get("contactPrivate")??"")||undefined
    };
    const r=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const result=await r.json().catch(()=>({}));
    if(r.ok){
      setNotice(result.onboardingComplete?"Profile saved. Your required onboarding fields are complete.":"Profile saved. Complete the highlighted professional fields before requesting verification.");
      const refreshed=await fetch("/api/profile");if(refreshed.ok)setData(await refreshed.json());
    }else setNotice(typeof result.error==="string"?result.error:"Unable to save. Check the fields.");
  }

  if(loading)return <div className="empty">Loading your real GazaWorks profile…</div>;
  if(!data)return <div className="empty">{notice||"Profile unavailable."}</div>;

  const i=(Array.isArray(data.individual_profiles)?data.individual_profiles[0]:data.individual_profiles)??{};
  const t=(Array.isArray(data.team_profiles)?data.team_profiles[0]:data.team_profiles)??{};
  const c=(Array.isArray(data.client_profiles)?data.client_profiles[0]:data.client_profiles)??{};
  const talent=data.account_type!=="client";

  return <form className="profile-form grid" onSubmit={submit}>
    <div className="card profile-section">
      <div className="profile-section-heading"><div><span className="badge">{data.account_type} account · permanent</span><h2>Basic account information</h2></div><span className={data.onboarding_complete?"status-chip success-chip":"status-chip"}>{data.onboarding_complete?"Profile ready":"Profile incomplete"}</span></div>
      <div className="form-grid two">
        <label>Public display name<input name="displayName" defaultValue={data.display_name} required/></label>
        {data.account_type==="individual"&&<label>Legal name <small className="muted">Private</small><input name="legalName" defaultValue={String(i.legal_name??"")}/></label>}
        <label>Private phone<input name="phonePrivate" defaultValue={String((data.account_type==="individual"?i.phone_private:c.phone_private)??"")}/></label>
        {data.account_type==="individual"&&<label>Private email<input name="emailPrivate" type="email" defaultValue={String(i.email_private??"")}/></label>}
      </div>
    </div>

    {data.account_type==="individual"&&<>
      <div className="card profile-section"><h2>Professional identity</h2><div className="form-grid two">
        <label>Professional title *<input name="professionalTitle" required defaultValue={String(i.professional_title??"")} placeholder="e.g. UI/UX Designer"/></label>
        <label>Gaza location *<input name="location" required defaultValue={String(i.gaza_location??"")} placeholder="e.g. Gaza City"/></label>
        <label className="span-two">Professional summary *<textarea name="bio" required rows={6} defaultValue={String(i.bio??"")} placeholder="Describe your expertise, strengths, and the kind of work you do."/></label>
        <label>Availability *<select name="availability" required defaultValue={String(i.availability??"")}><option value="">Choose</option><option>Available now</option><option>Part-time</option><option>Full-time</option><option>Project-based</option><option>Limited availability</option></select></label>
        <label>Years of experience<input name="yearsExperience" type="number" min="0" max="80" defaultValue={String(i.years_experience??"")}/></label>
      </div></div>
      <div className="card profile-section"><h2>Skills and tools</h2><p className="muted">Select the skills clients should be able to discover you by.</p><div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.has(s.id)}/><span>{s.skill_translations.find(x=>x.locale===locale)?.name??s.skill_translations.find(x=>x.locale==="en")?.name??s.slug}</span></label>)}</div><div className="form-grid two" style={{marginTop:16}}><label>Languages <small className="muted">comma separated</small><input name="languages" defaultValue={csv(i.languages)} placeholder="Arabic, English"/></label><label>Tools <small className="muted">comma separated</small><input name="tools" defaultValue={csv(i.tools)} placeholder="Figma, Premiere Pro, React"/></label></div></div>
      <div className="card profile-section"><h2>Experience and education</h2><div className="form-grid two"><label>Experience <small className="muted">one item per line</small><textarea name="experience" rows={7} defaultValue={lines(i.experience)} placeholder="2024–2026 · Product Designer · Company"/></label><label>Education <small className="muted">one item per line</small><textarea name="education" rows={7} defaultValue={lines(i.education)} placeholder="BBA · Islamic University of Gaza · 2026"/></label></div></div>
      <div className="card profile-section"><h2>Pricing</h2><div className="form-grid two"><label>Hourly rate <small className="muted">minor units, e.g. 2500 = $25</small><input name="hourlyRateMinor" type="number" min="0" defaultValue={String(i.hourly_rate_minor??"")}/></label><label>Currency<select name="currency" defaultValue={String(i.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label></div></div>
    </>}

    {data.account_type==="team"&&<>
      <div className="card profile-section"><h2>Team profile</h2><div className="form-grid two">
        <label>Gaza location *<input name="location" required defaultValue={String(t.gaza_location??"")}/></label>
        <label>Team size *<input name="teamSize" type="number" min="1" required defaultValue={String(t.team_size??1)}/></label>
        <label className="span-two">Team description *<textarea name="bio" required rows={6} defaultValue={String(t.description??"")}/></label>
        <label>Services <small className="muted">comma separated</small><input name="services" defaultValue={csv(t.services)}/></label>
        <label>Expertise <small className="muted">comma separated</small><input name="expertise" defaultValue={csv(t.expertise)}/></label>
        <label className="span-two">Achievements<textarea name="achievements" rows={5} defaultValue={String(t.achievements??"")}/></label>
        <label>Representative <small className="muted">Private</small><input name="representativePrivate" defaultValue={String(t.representative_private??"")}/></label>
        <label>Private contact<input name="contactPrivate" defaultValue={String(t.contact_private??"")}/></label>
        <label>Team rate <small className="muted">minor units</small><input name="teamRateMinor" type="number" min="0" defaultValue={String(t.rate_minor??"")}/></label>
        <label>Currency<select name="currency" defaultValue={String(t.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label>
      </div><div className="skill-grid" style={{marginTop:16}}>{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.has(s.id)}/><span>{s.skill_translations.find(x=>x.locale===locale)?.name??s.skill_translations.find(x=>x.locale==="en")?.name??s.slug}</span></label>)}</div></div>
    </>}

    {data.account_type==="client"&&<div className="card profile-section"><h2>Client / organization profile</h2><div className="form-grid two">
      <label>Country code *<input name="countryCode" minLength={2} maxLength={2} required defaultValue={String(c.country_code??"")} placeholder="QA"/></label>
      <label>Company / organization<input name="companyName" defaultValue={String(c.company_name??"")}/></label>
      <label>Organization type<input name="organizationType" defaultValue={String(c.organization_type??"")}/></label>
    </div></div>}

    {talent&&<div className="card profile-hint"><strong>Next step after your profile is complete</strong><p className="muted">Open Verification from your workspace, submit your request, then choose an available in-person interview slot.</p></div>}
    <div className="sticky-save"><button className="btn" type="submit">Save professional profile</button><p role="status">{notice}</p></div>
  </form>
}
