"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useMemo,useState} from "react";

type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type Data={account_type:"individual"|"team"|"client";display_name:string;onboarding_complete:boolean;individual_profiles?:Record<string,unknown>;team_profiles?:Record<string,unknown>;client_profiles?:Record<string,unknown>;profile_skills?:{skill_id:string;level:number}[]};

const lines=(v:unknown)=>Array.isArray(v)?v.map(String).join("\n"):"";
const csv=(v:unknown)=>Array.isArray(v)?v.map(String).join(", "):"";
const parseLines=(v:FormDataEntryValue|null)=>String(v??"").split("\n").map(x=>x.trim()).filter(Boolean);
const parseCsv=(v:FormDataEntryValue|null)=>String(v??"").split(",").map(x=>x.trim()).filter(Boolean);

export function ProfileForm({locale="en"}:{locale?:string}){
  const ar=locale==="ar";
  const [data,setData]=useState<Data|null>(null),[skills,setSkills]=useState<Skill[]>([]),[notice,setNotice]=useState(""),[loading,setLoading]=useState(true);
  useEffect(()=>{void Promise.all([apiFetch("/api/profile"),apiFetch("/api/taxonomy")]).then(async([p,t])=>{if(!p.ok)throw Error(ar?"سجّل الدخول لإدارة ملفك الشخصي":"Sign in to manage your profile");setData(await p.json());if(t.ok){const x=await t.json();setSkills(x.skills??[])}}).catch(e=>setNotice(e instanceof Error?e.message:(ar?"تعذّر تحميل الملف الشخصي":"Could not load profile"))).finally(()=>setLoading(false))},[ar]);
  const selected=useMemo(()=>new Set((data?.profile_skills??[]).map(x=>x.skill_id)),[data]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setNotice(ar?"جارٍ الحفظ…":"Saving…");
    const f=new FormData(e.currentTarget);const num=(k:string)=>{const v=String(f.get(k)??"").trim();return v?Number(v):undefined};
    const body={displayName:String(f.get("displayName")??""),professionalTitle:String(f.get("professionalTitle")??"")||undefined,bio:String(f.get("bio")??"")||undefined,location:String(f.get("location")??"")||undefined,availability:String(f.get("availability")??"")||undefined,yearsExperience:num("yearsExperience"),legalName:String(f.get("legalName")??"")||undefined,phonePrivate:String(f.get("phonePrivate")??"")||undefined,emailPrivate:String(f.get("emailPrivate")??"")||undefined,hourlyRateMinor:num("hourlyRateMinor"),teamRateMinor:num("teamRateMinor"),currency:String(f.get("currency")??"USD"),languages:parseCsv(f.get("languages")),tools:parseCsv(f.get("tools")),education:parseLines(f.get("education")),experience:parseLines(f.get("experience")),skillIds:f.getAll("skillIds").map(String),countryCode:String(f.get("countryCode")??"")||undefined,companyName:String(f.get("companyName")??"")||undefined,organizationType:String(f.get("organizationType")??"")||undefined,teamSize:num("teamSize"),services:parseCsv(f.get("services")),expertise:parseCsv(f.get("expertise")),achievements:String(f.get("achievements")??"")||undefined,representativePrivate:String(f.get("representativePrivate")??"")||undefined,contactPrivate:String(f.get("contactPrivate")??"")||undefined,dateOfBirth:String(f.get("dateOfBirth")??"")||undefined,preferredFields:parseCsv(f.get("preferredFields")),linkedinUrl:String(f.get("linkedinUrl")??"")||undefined,websiteUrl:String(f.get("websiteUrl")??"")||undefined,history:String(f.get("history")??"")||undefined};
    const r=await apiFetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await r.json().catch(()=>({}));
    if(r.ok){setNotice(result.onboardingComplete?(ar?"تم حفظ الملف. اكتملت الحقول الأساسية المطلوبة.":"Profile saved. Your required onboarding fields are complete."):(ar?"تم حفظ الملف. أكمل الحقول المهنية المطلوبة قبل طلب التحقق.":"Profile saved. Complete the highlighted professional fields before requesting verification."));const refreshed=await apiFetch("/api/profile");if(refreshed.ok)setData(await refreshed.json())}else setNotice(typeof result.error==="string"?result.error:(ar?"تعذّر الحفظ. تحقق من الحقول.":"Unable to save. Check the fields."));
  }

  if(loading)return <div className="empty">{ar?"جارٍ تحميل ملفك في GazaWorks…":"Loading your real GazaWorks profile…"}</div>;
  if(!data)return <div className="empty">{notice||(ar?"الملف الشخصي غير متاح.":"Profile unavailable.")}</div>;

  const i=(Array.isArray(data.individual_profiles)?data.individual_profiles[0]:data.individual_profiles)??{};
  const t=(Array.isArray(data.team_profiles)?data.team_profiles[0]:data.team_profiles)??{};
  const c=(Array.isArray(data.client_profiles)?data.client_profiles[0]:data.client_profiles)??{};
  const talent=data.account_type!=="client";
  const accountLabel=data.account_type==="individual"?(ar?"حساب فردي":"individual account"):data.account_type==="team"?(ar?"حساب فريق":"team account"):(ar?"حساب عميل":"client account");

  return <form className="profile-form grid" onSubmit={submit}>
    <div className="card profile-section">
      <div className="profile-section-heading"><div><span className="badge">{accountLabel} · {ar?"دائم":"permanent"}</span><h2>{ar?"معلومات الحساب الأساسية":"Basic account information"}</h2></div><span className={data.onboarding_complete?"status-chip success-chip":"status-chip"}>{data.onboarding_complete?(ar?"الملف مكتمل":"Profile ready"):(ar?"الملف غير مكتمل":"Profile incomplete")}</span></div>
      <div className="form-grid two">
        <label>{ar?"الاسم الظاهر للعامة":"Public display name"}<input name="displayName" defaultValue={data.display_name} required/></label>
        {data.account_type==="individual"&&<label>{ar?"الاسم القانوني":"Legal name"} <small className="muted">{ar?"خاص":"Private"}</small><input name="legalName" defaultValue={String(i.legal_name??"")}/></label>}
        <label>{ar?"رقم الهاتف الخاص":"Private phone"}<input name="phonePrivate" defaultValue={String((data.account_type==="individual"?i.phone_private:c.phone_private)??"")}/></label>
        {data.account_type==="individual"&&<label>{ar?"البريد الإلكتروني الخاص":"Private email"}<input name="emailPrivate" type="email" defaultValue={String(i.email_private??"")}/></label>}
        {data.account_type==="individual"&&<label>{ar?"تاريخ الميلاد":"Date of birth"} <small className="muted">{ar?"خاص — عند الحاجة الإدارية":"Private — only when administratively required"}</small><input name="dateOfBirth" type="date" defaultValue={String(i.date_of_birth_private??"")}/></label>}
      </div>
    </div>

    {data.account_type==="individual"&&<>
      <div className="card profile-section"><h2>{ar?"الهوية المهنية":"Professional identity"}</h2><div className="form-grid two">
        <label>{ar?"المسمى المهني *":"Professional title *"}<input name="professionalTitle" required defaultValue={String(i.professional_title??"")} placeholder={ar?"مثال: مصمم UI/UX":"e.g. UI/UX Designer"}/></label>
        <label>{ar?"الموقع داخل غزة *":"Gaza location *"}<input name="location" required defaultValue={String(i.gaza_location??"")} placeholder={ar?"مثال: مدينة غزة":"e.g. Gaza City"}/></label>
        <label className="span-two">{ar?"نبذة مهنية *":"Professional summary *"}<textarea name="bio" required rows={6} defaultValue={String(i.bio??"")} placeholder={ar?"عرّف بخبرتك ونقاط قوتك ونوع الأعمال التي تقدمها.":"Describe your expertise, strengths, and the kind of work you do."}/></label>
        <label>{ar?"التوفر للعمل *":"Availability *"}<select name="availability" required defaultValue={String(i.availability??"")}><option value="">{ar?"اختر":"Choose"}</option><option value="Available now">{ar?"متاح الآن":"Available now"}</option><option value="Part-time">{ar?"دوام جزئي":"Part-time"}</option><option value="Full-time">{ar?"دوام كامل":"Full-time"}</option><option value="Project-based">{ar?"حسب المشروع":"Project-based"}</option><option value="Limited availability">{ar?"توفّر محدود":"Limited availability"}</option></select></label>
        <label>{ar?"سنوات الخبرة":"Years of experience"}<input name="yearsExperience" type="number" min="0" max="80" defaultValue={String(i.years_experience??"")}/></label>
        <label>{ar?"المجالات المفضلة":"Preferred fields"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="preferredFields" defaultValue={csv(i.preferred_fields)} placeholder={ar?"التسويق، الفيديو، التصميم":"Marketing, video, design"}/></label>
      </div></div>
      <div className="card profile-section"><h2>{ar?"المهارات والأدوات":"Skills and tools"}</h2><p className="muted">{ar?"اختر المهارات التي تريد أن يجدك العملاء من خلالها.":"Select the skills clients should be able to discover you by."}</p><div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.has(s.id)}/><span>{s.skill_translations.find(x=>x.locale===locale)?.name??s.skill_translations.find(x=>x.locale==="en")?.name??s.slug}</span></label>)}</div><div className="form-grid two" style={{marginTop:16}}><label>{ar?"اللغات":"Languages"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="languages" defaultValue={csv(i.languages)} placeholder={ar?"العربية، الإنجليزية":"Arabic, English"}/></label><label>{ar?"الأدوات والبرامج":"Tools"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="tools" defaultValue={csv(i.tools)} placeholder="Figma, Premiere Pro, React"/></label></div></div>
      <div className="card profile-section"><h2>{ar?"الخبرة والتعليم":"Experience and education"}</h2><div className="form-grid two"><label>{ar?"الخبرات":"Experience"} <small className="muted">{ar?"عنصر واحد في كل سطر":"one item per line"}</small><textarea name="experience" rows={7} defaultValue={lines(i.experience)} placeholder={ar?"2024–2026 · مصمم منتجات · الشركة":"2024–2026 · Product Designer · Company"}/></label><label>{ar?"التعليم":"Education"} <small className="muted">{ar?"عنصر واحد في كل سطر":"one item per line"}</small><textarea name="education" rows={7} defaultValue={lines(i.education)} placeholder={ar?"بكالوريوس إدارة أعمال · الجامعة الإسلامية بغزة · 2026":"BBA · Islamic University of Gaza · 2026"}/></label></div></div>
      <div className="card profile-section"><h2>{ar?"روابط الهوية المهنية":"Professional identity links"}</h2><p className="muted">{ar?"يمكن للإدارة تعطيل هذه الروابط. لا تستخدمها كبديل لمعرض الأعمال داخل GazaWorks.":"Administrators can disable these links. Do not use them as an external portfolio replacement."}</p><div className="form-grid two"><label>LinkedIn<input name="linkedinUrl" type="url" defaultValue={String(i.linkedin_url??"")} placeholder="https://linkedin.com/in/..."/></label><label>{ar?"الموقع الرسمي":"Official website"}<input name="websiteUrl" type="url" defaultValue={String(i.website_url??"")} placeholder="https://..."/></label></div></div>
      <div className="card profile-section"><h2>{ar?"التسعير":"Pricing"}</h2><div className="form-grid two"><label>{ar?"السعر بالساعة":"Hourly rate"} <small className="muted">{ar?"بالوحدات الصغرى، مثال 2500 = 25 دولار":"minor units, e.g. 2500 = $25"}</small><input name="hourlyRateMinor" type="number" min="0" defaultValue={String(i.hourly_rate_minor??"")}/></label><label>{ar?"العملة":"Currency"}<select name="currency" defaultValue={String(i.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label></div></div>
    </>}

    {data.account_type==="team"&&<>
      <div className="card profile-section"><h2>{ar?"ملف الفريق":"Team profile"}</h2><div className="form-grid two">
        <label>{ar?"الموقع داخل غزة *":"Gaza location *"}<input name="location" required defaultValue={String(t.gaza_location??"")}/></label>
        <label>{ar?"عدد أعضاء الفريق *":"Team size *"}<input name="teamSize" type="number" min="1" required defaultValue={String(t.team_size??1)}/></label>
        <label className="span-two">{ar?"وصف الفريق *":"Team description *"}<textarea name="bio" required rows={6} defaultValue={String(t.description??"")}/></label>
        <label>{ar?"الخدمات":"Services"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="services" defaultValue={csv(t.services)}/></label>
        <label>{ar?"مجالات الخبرة":"Expertise"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="expertise" defaultValue={csv(t.expertise)}/></label>
        <label className="span-two">{ar?"تاريخ الفريق":"Team history"}<textarea name="history" rows={5} defaultValue={String(t.history??"")}/></label>
        <label className="span-two">{ar?"الإنجازات":"Achievements"}<textarea name="achievements" rows={5} defaultValue={String(t.achievements??"")}/></label>
        <label>LinkedIn<input name="linkedinUrl" type="url" defaultValue={String(t.linkedin_url??"")} placeholder="https://linkedin.com/company/..."/></label>
        <label>{ar?"الموقع الرسمي":"Official website"}<input name="websiteUrl" type="url" defaultValue={String(t.website_url??"")} placeholder="https://..."/></label>
        <label>{ar?"ممثل الفريق":"Representative"} <small className="muted">{ar?"خاص":"Private"}</small><input name="representativePrivate" defaultValue={String(t.representative_private??"")}/></label>
        <label>{ar?"بيانات التواصل الخاصة":"Private contact"}<input name="contactPrivate" defaultValue={String(t.contact_private??"")}/></label>
        <label>{ar?"سعر الفريق":"Team rate"} <small className="muted">{ar?"بالوحدات الصغرى":"minor units"}</small><input name="teamRateMinor" type="number" min="0" defaultValue={String(t.rate_minor??"")}/></label>
        <label>{ar?"العملة":"Currency"}<select name="currency" defaultValue={String(t.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label>
      </div><div className="skill-grid" style={{marginTop:16}}>{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.has(s.id)}/><span>{s.skill_translations.find(x=>x.locale===locale)?.name??s.skill_translations.find(x=>x.locale==="en")?.name??s.slug}</span></label>)}</div></div>
    </>}

    {data.account_type==="client"&&<div className="card profile-section"><h2>{ar?"ملف العميل / المؤسسة":"Client / organization profile"}</h2><div className="form-grid two">
      <label>{ar?"رمز الدولة *":"Country code *"}<input name="countryCode" minLength={2} maxLength={2} required defaultValue={String(c.country_code??"")} placeholder="QA"/></label>
      <label>{ar?"الشركة / المؤسسة":"Company / organization"}<input name="companyName" defaultValue={String(c.company_name??"")}/></label>
      <label>{ar?"نوع المؤسسة":"Organization type"}<input name="organizationType" defaultValue={String(c.organization_type??"")}/></label>
    </div></div>}

    {talent&&<div className="card profile-hint"><strong>{ar?"الخطوة التالية بعد إكمال الملف":"Next step after your profile is complete"}</strong><p className="muted">{ar?"افتح قسم التحقق من مساحة العمل، أرسل طلب التحقق، ثم اختر موعدًا متاحًا للمقابلة الحضورية.":"Open Verification from your workspace, submit your request, then choose an available in-person interview slot."}</p></div>}
    <div className="sticky-save"><button className="btn" type="submit">{ar?"حفظ الملف المهني":"Save professional profile"}</button><p role="status">{notice}</p></div>
  </form>
}
