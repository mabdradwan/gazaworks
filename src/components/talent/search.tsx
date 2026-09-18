"use client";
import {apiFetch} from "@/lib/api-fetch";
import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

type Translation={locale:string;name:string};
type Skill={id:string;slug:string;skill_translations:Translation[]};
type Category={id:string;slug:string;category_translations:Translation[]};
type Portfolio={id:string;title:string;portfolio_media?:{id:string;media_type:string;url?:string|null}[]};
type Talent={
  id:string;account_type:"individual"|"team";display_name:string;avatar_url?:string|null;created_at:string;rating?:number|null;review_count?:number;project_count?:number;completed_count?:number;repeat_client_count?:number;
  individual_profiles?:{professional_title?:string;bio?:string;availability?:string;years_experience?:number;hourly_rate_minor?:number;currency?:string;verification_status:string;languages?:unknown[]}|null;
  team_profiles?:{team_name?:string;description?:string;team_size?:number;rate_minor?:number;currency?:string;verification_status:string}|null;
  portfolios?:Portfolio[];
};

export function TalentSearch({locale="en"}:{locale?:string}){
  const ar=locale==="ar";
  const [items,setItems]=useState<Talent[]>([]),[skills,setSkills]=useState<Skill[]>([]),[categories,setCategories]=useState<Category[]>([]),[state,setState]=useState(ar?"استخدم الفلاتر للبحث في قاعدة المواهب الموثقة.":"Search the verified GazaWorks talent database."),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
  const tr=(xs:Translation[],slug:string)=>xs.find(x=>x.locale===locale)?.name??xs.find(x=>x.locale==="en")?.name??slug;
  useEffect(()=>{void apiFetch("/api/taxonomy").then(async r=>{if(r.ok){const d=await r.json();setSkills(d.skills??[]);setCategories(d.categories??[])}})},[]);

  async function search(e?:FormEvent<HTMLFormElement>){
    e?.preventDefault();setBusy(true);setState(ar?"جارٍ البحث…":"Searching…");setNotice("");
    const form=e?.currentTarget??document.querySelector<HTMLFormElement>("#talent-search-form");
    if(!form){setBusy(false);return}
    const f=new FormData(form);
    const params=new URLSearchParams({
      q:String(f.get("q")??""),type:String(f.get("type")??""),skillId:String(f.get("skillId")??""),categoryId:String(f.get("categoryId")??""),
      minExperience:String(f.get("minExperience")??""),maxRate:String(Math.round(Number(f.get("maxRate")||0)*100)||""),minRating:String(f.get("minRating")??""),
      availability:String(f.get("availability")??""),language:String(f.get("language")??""),industry:String(f.get("industry")??"")
    });
    const r=await apiFetch("/api/talent?"+params.toString());
    if(!r.ok){setItems([]);setState(r.status===401?(ar?"سجّل الدخول للوصول إلى الملفات التفصيلية.":"Sign in to access detailed talent profiles."):(ar?"البحث غير متاح مؤقتًا.":"Search is temporarily unavailable."));setBusy(false);return}
    const rows=await r.json();setItems(rows);setState(rows.length?"":(ar?"لم نجد مواهب مطابقة لهذه الفلاتر.":"No verified talent matched these filters."));setBusy(false);
  }

  async function save(id:string){const r=await apiFetch("/api/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({talentId:id})});setNotice(r.ok?(ar?"تم الحفظ في المفضلة.":"Saved to favorites."):(ar?"الحفظ متاح لحسابات العملاء فقط.":"Only client accounts can save talent."))}

  return <>
    <form id="talent-search-form" className="card talent-search-form" onSubmit={search}>
      <div className="form-grid three">
        <label>{ar?"المهنة أو الاسم":"Profession or name"}<input name="q" placeholder={ar?"مثال: مونتير فيديو":"e.g. video editor"}/></label>
        <label>{ar?"نوع الحساب":"Talent type"}<select name="type"><option value="">{ar?"أفراد وفرق":"Individuals and teams"}</option><option value="individual">{ar?"أفراد":"Individuals"}</option><option value="team">{ar?"فرق":"Teams"}</option></select></label>
        <label>{ar?"المهارة":"Skill"}<select name="skillId"><option value="">{ar?"أي مهارة":"Any skill"}</option>{skills.map(s=><option key={s.id} value={s.id}>{tr(s.skill_translations,s.slug)}</option>)}</select></label>
        <label>{ar?"تصنيف معرض الأعمال":"Portfolio category"}<select name="categoryId"><option value="">{ar?"أي تصنيف":"Any category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{tr(c.category_translations,c.slug)}</option>)}</select></label>
        <label>{ar?"الحد الأدنى للخبرة":"Minimum experience"}<input name="minExperience" type="number" min="0" max="80" placeholder={ar?"سنوات":"years"}/></label>
        <label>{ar?"أقصى سعر معلن":"Maximum listed rate"}<input name="maxRate" type="number" min="0" step="0.01" placeholder="USD"/></label>
        <label>{ar?"الحد الأدنى للتقييم":"Minimum rating"}<select name="minRating"><option value="">—</option><option value="4">4+</option><option value="4.5">4.5+</option><option value="5">5</option></select></label>
        <label>{ar?"التوفر":"Availability"}<select name="availability"><option value="">{ar?"أي حالة":"Any"}</option><option value="Available now">{ar?"متاح الآن":"Available now"}</option><option value="Part-time">{ar?"دوام جزئي":"Part-time"}</option><option value="Full-time">{ar?"دوام كامل":"Full-time"}</option><option value="Project-based">{ar?"حسب المشروع":"Project-based"}</option></select></label>
        <label>{ar?"اللغة":"Language"}<input name="language" placeholder={ar?"العربية / الإنجليزية":"Arabic / English"}/></label>
        <label>{ar?"القطاع / المجال":"Industry"}<input name="industry" placeholder={ar?"إعلام، تقنية، تعليم…":"Media, technology, education…"}/></label>
      </div>
      <div className="form-actions"><button className="btn" disabled={busy}>{busy?(ar?"جارٍ البحث…":"Searching…"):(ar?"بحث":"Search")}</button><button className="btn secondary" type="reset" onClick={()=>{setItems([]);setState(ar?"استخدم الفلاتر للبحث في قاعدة المواهب الموثقة.":"Search the verified GazaWorks talent database.")}}>{ar?"مسح الفلاتر":"Clear filters"}</button></div>
    </form>

    {notice&&<p role="status">{notice}</p>}
    {state&&<div className="empty" style={{marginTop:24}}>{state}</div>}
    <div className="talent-grid">
      {items.map(x=>{
        const ind=Array.isArray(x.individual_profiles)?x.individual_profiles[0]:x.individual_profiles;
        const team=Array.isArray(x.team_profiles)?x.team_profiles[0]:x.team_profiles;
        const rate=Number(ind?.hourly_rate_minor??team?.rate_minor??0),currency=ind?.currency??team?.currency??"USD";
        const price=rate?new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency}).format(rate/100):(ar?"السعر حسب العرض":"Price by offer");
        const firstMedia=x.portfolios?.flatMap(p=>p.portfolio_media??[]).find(m=>m.media_type==="image"&&m.url);
        return <article className="card talent-card" key={x.id}>
          <div className="talent-card-cover" style={firstMedia?.url?{backgroundImage:"url("+firstMedia.url+")"}:{}}/>
          <div className="talent-card-head"><div className="talent-mini-avatar" style={x.avatar_url?{backgroundImage:"url("+x.avatar_url+")"}:{}}>{!x.avatar_url&&x.display_name.slice(0,1).toUpperCase()}</div><div><span className="badge">✓ {ar?"موثّق":"Verified"} · {x.account_type==="team"?(ar?"فريق":"team"):(ar?"فرد":"individual")}</span><h2>{x.display_name}</h2><strong>{ind?.professional_title??team?.team_name}</strong></div></div>
          <p className="muted clamp-3">{ind?.bio??team?.description??(ar?"تفاصيل الملف متاحة بعد تسجيل الدخول.":"Profile details available to signed-in clients.")}</p>
          <div className="trust-strip compact"><span><strong>{x.rating??(ar?"جديد":"New")}</strong><small>{ar?"تقييم":"rating"}</small></span><span><strong>{x.completed_count??0}</strong><small>{ar?"مكتمل":"completed"}</small></span><span><strong>{ind?.years_experience??"—"}</strong><small>{ar?"خبرة":"years"}</small></span></div>
          <div className="card-head"><span className="muted">{price}</span>{x.review_count? <small>{x.review_count} {ar?"تقييم":"reviews"}</small>:null}</div>
          <div className="form-actions"><Link className="btn" href={"/"+locale+"/talent/"+x.id}>{ar?"عرض الملف":"View profile"}</Link><button className="btn secondary" onClick={()=>void save(x.id)}>{ar?"حفظ":"Save"}</button></div>
        </article>
      })}
    </div>
  </>
}

