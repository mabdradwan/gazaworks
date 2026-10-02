"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useEffect,useRef,useState} from "react";

import {profileRateMinor,profileRateDisplay,profileCsv} from "@/domain/profile-form-values";

import {RoleSelect,ToolsSelect,FieldSelect,LanguagesSelect,ContactInput,LocationInput,TagSelect} from '@/components/professional/controls';
import {roles,sectors,westernDigits} from '@/domain/professional-data';
type Data={account_type:"individual"|"team"|"client";display_name:string;onboarding_complete:boolean;individual_profiles?:Record<string,unknown>;team_profiles?:Record<string,unknown>;client_profiles?:Record<string,unknown>;profile_skills?:{skill_id:string;level:number}[]};

const lines=(v:unknown)=>Array.isArray(v)?v.map(String).join("\n"):"";
const parseLines=(v:FormDataEntryValue|null)=>String(v??"").split("\n").map(x=>x.trim()).filter(Boolean);
const parseCsv=profileCsv;

export function ProfileForm({locale="en"}:{locale?:string}){
  const ar=locale==="ar";
  const form=useRef<HTMLFormElement>(null);
  const writing=useRef(false),[saving,setSaving]=useState(false);
  const [data,setData]=useState<Data|null>(null),[notice,setNotice]=useState(""),[loading,setLoading]=useState(true);
  const [title,setTitle]=useState(''),[location,setLocation]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[tools,setTools]=useState<string[]>([]),[languages,setLanguages]=useState<string[]>([]),[fields,setFields]=useState<string[]>([]),[services,setServices]=useState<string[]>([]),[expertise,setExpertise]=useState<string[]>([]);
  useEffect(()=>{let active=true;void apiFetch('/api/profile').then(async r=>{if(!r.ok)throw Error();const d=await r.json();if(!active)return;setData(d);const i=(Array.isArray(d.individual_profiles)?d.individual_profiles[0]:d.individual_profiles)??{};const t=(Array.isArray(d.team_profiles)?d.team_profiles[0]:d.team_profiles)??{};const c=(Array.isArray(d.client_profiles)?d.client_profiles[0]:d.client_profiles)??{};setTitle(String(i.professional_title??''));setLocation(String((d.account_type==='team'?t.gaza_location:i.gaza_location)??''));setPhone(westernDigits(String((d.account_type==='individual'?i.phone_private:c.phone_private)??'')));setEmail(String(i.email_private??''));setTools(i.tools??[]);setLanguages(i.languages??[]);setFields(i.preferred_fields??[]);setServices(t.services??[]);setExpertise(t.expertise??[])}).catch(()=>setNotice(ar?'تعذّر تحميل الملف':'Could not load profile')).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[ar]);

  useEffect(()=>{function changed(event:Event){const patch=(event as CustomEvent<{changes:Record<string,unknown>}>).detail?.changes;if(!patch)return;for(const [key,value] of Object.entries(patch)){if(key==='services')setServices(Array.isArray(value)?value.map(String):[]);else if(key==='expertise')setExpertise(Array.isArray(value)?value.map(String):[]);else if(key==='professionalTitle')setTitle(String(value??''));else if(key==='location')setLocation(String(value??''));else if(key==='tools')setTools(Array.isArray(value)?value:[]);else if(key==='languages')setLanguages(Array.isArray(value)?value:[]);else if(key==='preferredFields')setFields(Array.isArray(value)?value:[]);else {const control=form.current?.elements.namedItem(key);if(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement||control instanceof HTMLSelectElement)control.value=Array.isArray(value)?value.join(key==='services'||key==='expertise'?', ':'\n'):String(value??'')}}if(typeof patch.displayName==='string')setData(v=>v?{...v,display_name:patch.displayName as string}:v)}window.addEventListener('gazaworks-profile-changed',changed);return()=>window.removeEventListener('gazaworks-profile-changed',changed)},[]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(writing.current)return;writing.current=true;setSaving(true);
    try{setNotice(ar?"جارٍ الحفظ…":"Saving…");
    const f=new FormData(e.currentTarget);const num=(k:string)=>{const v=String(f.get(k)??"").trim();return v?Number(westernDigits(v)):undefined};
    const body={displayName:String(f.get("displayName")??""),professionalTitle:String(f.get("professionalTitle")??"")||undefined,bio:String(f.get("bio")??"")||undefined,location:String(f.get("location")??"")||undefined,availability:String(f.get("availability")??"")||undefined,yearsExperience:num("yearsExperience"),legalName:String(f.get("legalName")??"")||undefined,phonePrivate:String(f.get("phonePrivate")??"")||undefined,emailPrivate:String(f.get("emailPrivate")??"")||undefined,hourlyRateMinor:profileRateMinor(f.get("hourlyRate")),teamRateMinor:profileRateMinor(f.get("teamRate")),currency:String(f.get("currency")??"USD"),languages:parseCsv(f.get("languages")),tools:parseCsv(f.get("tools")),education:parseLines(f.get("education")),experience:parseLines(f.get("experience")),countryCode:String(f.get("countryCode")??"")||undefined,companyName:String(f.get("companyName")??"")||undefined,organizationType:String(f.get("organizationType")??"")||undefined,teamSize:num("teamSize"),services:parseCsv(f.get("services")),expertise:parseCsv(f.get("expertise")),achievements:String(f.get("achievements")??"")||undefined,representativePrivate:String(f.get("representativePrivate")??"")||undefined,contactPrivate:String(f.get("contactPrivate")??"")||undefined,dateOfBirth:String(f.get("dateOfBirth")??"")||undefined,preferredFields:parseCsv(f.get("preferredFields")),linkedinUrl:String(f.get("linkedinUrl")??"")||undefined,websiteUrl:String(f.get("websiteUrl")??"")||undefined,history:String(f.get("history")??"")||undefined};
    const r=await apiFetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await r.json().catch(()=>({}));
    if(r.ok){setNotice(result.onboardingComplete?(ar?"تم حفظ الملف. اكتملت الحقول الأساسية المطلوبة.":"Profile saved. Your required onboarding fields are complete."):(ar?"تم حفظ الملف. أكمل الحقول المهنية المطلوبة قبل طلب التحقق.":"Profile saved. Complete the highlighted professional fields before requesting verification."));const refreshed=await apiFetch("/api/profile");if(refreshed.ok)setData(await refreshed.json())}else setNotice(typeof result.error==="string"?result.error:(ar?"تعذّر الحفظ. تحقق من الحقول.":"Unable to save. Check the fields."));
    }catch{setNotice(ar?"تعذّر الحفظ. أدخل سعرًا صحيحًا بخانتين عشريتين كحد أقصى ثم أعد المحاولة.":"Unable to save. Enter a valid rate with up to two decimal places and try again.")}finally{writing.current=false;setSaving(false)}
  }

  if(loading)return <div className="empty">{ar?"جارٍ تحميل ملفك في GazaWorks…":"Loading your real GazaWorks profile…"}</div>;
  if(!data)return <div className="empty">{notice||(ar?"الملف الشخصي غير متاح.":"Profile unavailable.")}</div>;

  const i=(Array.isArray(data.individual_profiles)?data.individual_profiles[0]:data.individual_profiles)??{};
  const t=(Array.isArray(data.team_profiles)?data.team_profiles[0]:data.team_profiles)??{};
  const c=(Array.isArray(data.client_profiles)?data.client_profiles[0]:data.client_profiles)??{};
  const talent=data.account_type!=="client";
  const accountLabel=data.account_type==="individual"?(ar?"حساب فردي":"individual account"):data.account_type==="team"?(ar?"حساب فريق":"team account"):(ar?"حساب عميل":"client account");

  return <form ref={form} className="profile-form grid" onSubmit={submit}>
    <fieldset disabled={saving} className="grid" style={{border:0,padding:0,margin:0,minWidth:0}}>
    <div className="card profile-section">
      <div className="profile-section-heading"><div><span className="badge">{accountLabel} · {ar?"دائم":"permanent"}</span><h2>{ar?"معلومات الحساب الأساسية":"Basic account information"}</h2></div><span className={data.onboarding_complete?"status-chip success-chip":"status-chip"}>{data.onboarding_complete?(ar?"الملف مكتمل":"Profile ready"):(ar?"الملف غير مكتمل":"Profile incomplete")}</span></div>
      <div className="form-grid two">
        <label>{ar?"الاسم الظاهر للعامة":"Public display name"}<input name="displayName" defaultValue={data.display_name} required/></label>
        {data.account_type==="individual"&&<label>{ar?"الاسم القانوني":"Legal name"} <small className="muted">{ar?"خاص":"Private"}</small><input name="legalName" defaultValue={String(i.legal_name??"")}/></label>}
        {data.account_type!=="team"&&<ContactInput locale={locale} kind="phone" name="phonePrivate" value={phone} onChange={setPhone} localPhone={data.account_type==="individual"} required={data.account_type==="individual"}/>}
        {data.account_type==="individual"&&<ContactInput locale={locale} kind="email" name="emailPrivate" value={email} onChange={setEmail}/>}
        {data.account_type==="individual"&&<label>{ar?"تاريخ الميلاد":"Date of birth"} <small className="muted">{ar?"خاص — عند الحاجة الإدارية":"Private — only when administratively required"}</small><input name="dateOfBirth" type="date" dir="ltr" lang="en" defaultValue={String(i.date_of_birth_private??"")}/></label>}
      </div>
    </div>

    {data.account_type==="individual"&&<>
      <div className="card profile-section"><h2>{ar?"الهوية المهنية":"Professional identity"}</h2><div className="form-grid two">
        <div className="grid"><span>{ar?"المسمى المهني *":"Professional title *"}</span><RoleSelect locale={locale} value={title} onChange={setTitle}/></div>
        <div className="grid"><span>{ar?"الموقع داخل غزة *":"Gaza location *"}</span><LocationInput locale={locale} value={location} onChange={setLocation}/></div>
        <label className="span-two">{ar?"نبذة مهنية *":"Professional summary *"}<textarea name="bio" required rows={6} defaultValue={String(i.bio??"")} placeholder={ar?"عرّف بخبرتك ونقاط قوتك ونوع الأعمال التي تقدمها.":"Describe your expertise, strengths, and the kind of work you do."}/></label>
        <label>{ar?"التوفر للعمل *":"Availability *"}<select name="availability" required defaultValue={String(i.availability??"")}><option value="">{ar?"اختر":"Choose"}</option><option value="Available now">{ar?"متاح الآن":"Available now"}</option><option value="Part-time">{ar?"دوام جزئي":"Part-time"}</option><option value="Full-time">{ar?"دوام كامل":"Full-time"}</option><option value="Project-based">{ar?"حسب المشروع":"Project-based"}</option><option value="Limited availability">{ar?"توفّر محدود":"Limited availability"}</option></select></label>
        <label>{ar?"سنوات الخبرة":"Years of experience"}<input name="yearsExperience" type="text" inputMode="numeric" pattern="[0-9]{1,2}" onInput={e=>{e.currentTarget.value=westernDigits(e.currentTarget.value)}} min="0" max="80" defaultValue={String(i.years_experience??"")}/></label>
        <FieldSelect locale={locale} value={fields} onChange={setFields}/>
      </div></div>
      <div className="card profile-section"><div className="form-grid two"><LanguagesSelect locale={locale} value={languages} onChange={setLanguages}/><ToolsSelect locale={locale} title={title} value={tools} onChange={setTools}/></div></div>
      <div className="card profile-section"><h2>{ar?"الخبرة والتعليم":"Experience and education"}</h2><div className="form-grid two"><label>{ar?"الخبرات":"Experience"} <small className="muted">{ar?"عنصر واحد في كل سطر":"one item per line"}</small><textarea name="experience" rows={7} defaultValue={lines(i.experience)} placeholder={ar?"2024–2026 · مصمم منتجات · الشركة":"2024–2026 · Product Designer · Company"}/></label><label>{ar?"التعليم":"Education"} <small className="muted">{ar?"عنصر واحد في كل سطر":"one item per line"}</small><textarea name="education" rows={7} defaultValue={lines(i.education)} placeholder={ar?"بكالوريوس إدارة أعمال · الجامعة الإسلامية بغزة · 2026":"BBA · Islamic University of Gaza · 2026"}/></label></div></div>
      <div className="card profile-section"><h2>{ar?"روابط الهوية المهنية":"Professional identity links"}</h2><p className="muted">{ar?"يمكن للإدارة تعطيل هذه الروابط. لا تستخدمها كبديل لمعرض الأعمال داخل GazaWorks.":"Administrators can disable these links. Do not use them as an external portfolio replacement."}</p><div className="form-grid two"><label>LinkedIn<input name="linkedinUrl" type="url" defaultValue={String(i.linkedin_url??"")} placeholder="https://linkedin.com/in/..."/></label><label>{ar?"الموقع الرسمي":"Official website"}<input name="websiteUrl" type="url" defaultValue={String(i.website_url??"")} placeholder="https://..."/></label></div></div>
      <div className="card profile-section"><h2>{ar?"التسعير":"Pricing"}</h2><div className="form-grid two"><label>{ar?"السعر بالساعة":"Hourly rate"} <small className="muted">{ar?"أدخل المبلغ بالعملة المختارة، مثال: 25.50":"Amount in the selected currency, e.g. 25.50"}</small><input name="hourlyRate" type="number" min="0" max="1000000" step="0.01" defaultValue={profileRateDisplay(i.hourly_rate_minor)}/></label><label>{ar?"العملة":"Currency"}<select name="currency" defaultValue={String(i.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label></div></div>
    </>}

    {data.account_type==="team"&&<>
      <div className="card profile-section"><h2>{ar?"ملف الفريق":"Team profile"}</h2><div className="form-grid two">
        <div className="grid"><span>{ar?"الموقع داخل غزة *":"Gaza location *"}</span><LocationInput locale={locale} value={location} onChange={setLocation}/></div>
        <label>{ar?"عدد أعضاء الفريق *":"Team size *"}<input name="teamSize" type="number" min="1" required defaultValue={String(t.team_size??1)}/></label>
        <label className="span-two">{ar?"وصف الفريق *":"Team description *"}<textarea name="bio" required rows={6} defaultValue={String(t.description??"")}/></label>
        <TagSelect locale={locale} name="services" title={ar?"الخدمات":"Services"} value={services} onChange={setServices} options={roles.map(r=>r.en)} display={v=>ar?(roles.find(r=>r.en===v)?.ar??v):v}/>
        <TagSelect locale={locale} name="expertise" title={ar?"مجالات الخبرة":"Expertise"} value={expertise} onChange={setExpertise} options={sectors.map(s=>s[2])} display={v=>ar?(sectors.find(s=>s[2]===v)?.[1]??v):v}/>
        <label className="span-two">{ar?"تاريخ الفريق":"Team history"}<textarea name="history" rows={5} defaultValue={String(t.history??"")}/></label>
        <label className="span-two">{ar?"الإنجازات":"Achievements"}<textarea name="achievements" rows={5} defaultValue={String(t.achievements??"")}/></label>
        <label>LinkedIn<input name="linkedinUrl" type="url" defaultValue={String(t.linkedin_url??"")} placeholder="https://linkedin.com/company/..."/></label>
        <label>{ar?"الموقع الرسمي":"Official website"}<input name="websiteUrl" type="url" defaultValue={String(t.website_url??"")} placeholder="https://..."/></label>
        <label>{ar?"ممثل الفريق":"Representative"} <small className="muted">{ar?"خاص":"Private"}</small><input name="representativePrivate" defaultValue={String(t.representative_private??"")}/></label>
        <label>{ar?"بيانات التواصل الخاصة":"Private contact"}<input name="contactPrivate" defaultValue={String(t.contact_private??"")}/></label>
        <label>{ar?"سعر الفريق":"Team rate"} <small className="muted">{ar?"أدخل المبلغ بالعملة المختارة":"Amount in the selected currency"}</small><input name="teamRate" type="number" min="0" max="1000000" step="0.01" defaultValue={profileRateDisplay(t.rate_minor)}/></label>
        <label>{ar?"العملة":"Currency"}<select name="currency" defaultValue={String(t.currency??"USD")}><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label>
      </div></div>
    </>}

    {data.account_type==="client"&&<div className="card profile-section"><h2>{ar?"ملف العميل / المؤسسة":"Client / organization profile"}</h2><div className="form-grid two">
      <label>{ar?"رمز الدولة *":"Country code *"}<input name="countryCode" minLength={2} maxLength={2} required defaultValue={String(c.country_code??"")} placeholder="QA"/></label>
      <label>{ar?"الشركة / المؤسسة":"Company / organization"}<input name="companyName" defaultValue={String(c.company_name??"")}/></label>
      <label>{ar?"نوع المؤسسة":"Organization type"}<input name="organizationType" defaultValue={String(c.organization_type??"")}/></label>
    </div></div>}

    {talent&&<div className="card profile-hint"><strong>{ar?"الخطوة التالية بعد إكمال الملف":"Next step after your profile is complete"}</strong><p className="muted">{ar?"افتح قسم التحقق من مساحة العمل، أرسل طلب التحقق، ثم اختر موعدًا متاحًا للمقابلة الحضورية.":"Open Verification from your workspace, submit your request, then choose an available in-person interview slot."}</p></div>}
    </fieldset>
    <div className="sticky-save"><button disabled={saving} className="btn" type="submit">{saving?(ar?"جارٍ الحفظ…":"Saving…"):(ar?"حفظ الملف المهني":"Save professional profile")}</button><p role="status">{notice}</p></div>
  </form>
}
