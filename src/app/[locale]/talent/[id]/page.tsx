import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {directoryAccess} from "@/lib/directory";
import {TalentActions} from "@/components/talent/talent-actions";

export const metadata={robots:{index:false,follow:false}};

export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){
  const {locale,id}=await params,ar=locale==="ar",db=await directoryAccess();
  if(!db)redirect("/"+locale+"/auth");
  const {data:p,error}=await db.from("profiles").select("id,account_type,display_name,avatar_path,created_at,individual_profiles(professional_title,bio,gaza_location,availability,years_experience,hourly_rate_minor,currency,verification_status,languages,tools,preferred_fields,linkedin_url,website_url),team_profiles(team_name,description,history,team_size,gaza_location,rate_minor,currency,verification_status,services,expertise,achievements,linkedin_url,website_url),profile_skills(skill_id,level,skills(slug,skill_translations(locale,name))),team_members(id,public_name,professional_title,role,bio,image_path,privacy_mode,skills),portfolios(id,title,description,completed_on,category_id,portfolio_media(id,storage_path,mime_type,media_type,thumbnail_path))").eq("id",id).eq("account_status","active").single();
  if(error||!p||!["individual","team"].includes(p.account_type))notFound();
  const ind=Array.isArray(p.individual_profiles)?p.individual_profiles[0]:p.individual_profiles;
  const team=Array.isArray(p.team_profiles)?p.team_profiles[0]:p.team_profiles;
  if(String(ind?.verification_status??team?.verification_status)!=="verified")notFound();

  const avatar=p.avatar_path?(await db.storage.from("avatars").createSignedUrl(p.avatar_path,1800)).data?.signedUrl??null:null;
  const media=await Promise.all((p.portfolios??[]).map(async port=>({...port,portfolio_media:await Promise.all((port.portfolio_media??[]).map(async m=>({...m,url:(await db.storage.from("portfolio").createSignedUrl(m.storage_path,1800)).data?.signedUrl??null})))})));
  const {data:reviews}=await db.from("reviews").select("overall,communication,professionalism,quality,delivery,feedback").eq("subject_id",id).eq("moderation_status","published").limit(20);
  const avg=reviews?.length?Math.round((reviews.reduce((s,r)=>s+Number(r.overall??0),0)/reviews.length)*10)/10:null;
  const {count:completed}=await db.from("projects").select("id",{count:"exact",head:true}).eq("talent_id",id).in("status",["completed","payout_pending","paid"]);

  const title=ind?.professional_title??team?.team_name??p.display_name;
  const bio=ind?.bio??team?.description??"";
  const rate=Number(ind?.hourly_rate_minor??team?.rate_minor??0),currency=String(ind?.currency??team?.currency??"USD");
  const skills=(p.profile_skills??[]).map(ps=>{
    const s=Array.isArray(ps.skills)?ps.skills[0]:ps.skills;
    const tr=s?.skill_translations??[];return tr.find(x=>x.locale===locale)?.name??tr.find(x=>x.locale==="en")?.name??s?.slug;
  }).filter(Boolean);

  return <section className="container talent-detail">
    <Link className="muted" href={"/"+locale+"/talent"}>← {ar?"العودة للبحث":"Back to talent search"}</Link>
    <div className="talent-hero card">
      <div className="talent-avatar" style={avatar?{backgroundImage:"url("+avatar+")"}:{}}>{!avatar&&p.display_name.slice(0,1).toUpperCase()}</div>
      <div className="talent-hero-copy"><span className="badge">✓ {ar?"موثّق من GazaWorks":"GazaWorks Verified"} · {p.account_type==="team"?(ar?"فريق":"Team"):(ar?"محترف":"Individual")}</span><h1>{p.display_name}</h1><h2>{title}</h2><p className="muted">{bio}</p>
        <div className="trust-strip"><span><strong>{avg??(ar?"جديد":"New")}</strong><small>{ar?"التقييم":"Rating"}</small></span><span><strong>{completed??0}</strong><small>{ar?"مشاريع مكتملة":"Completed projects"}</small></span><span><strong>{new Date(p.created_at).getFullYear()}</strong><small>{ar?"عضو منذ":"Member since"}</small></span></div>
      </div>
      <div className="talent-action-box">{rate>0&&<div><small className="muted">{ar?"السعر المعلن":"Listed rate"}</small><strong>{new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency}).format(rate/100)}</strong></div>}<TalentActions talentId={p.id} locale={locale}/></div>
    </div>

    <div className="talent-columns">
      <div className="grid">
        <article className="card"><h2>{ar?"الخبرة المهنية":"Professional profile"}</h2><div className="meta-grid">
          {ind?.gaza_location&&<span>{ar?"الموقع":"Location"}: <strong>{ind.gaza_location}</strong></span>}
          {ind?.availability&&<span>{ar?"التوفر":"Availability"}: <strong>{ind.availability}</strong></span>}
          {ind?.years_experience!==null&&ind?.years_experience!==undefined&&<span>{ar?"سنوات الخبرة":"Experience"}: <strong>{ind.years_experience}</strong></span>}
          {team?.team_size&&<span>{ar?"حجم الفريق":"Team size"}: <strong>{team.team_size}</strong></span>}
          {team?.gaza_location&&<span>{ar?"الموقع":"Location"}: <strong>{team.gaza_location}</strong></span>}
        </div>
        {skills.length>0&&<div className="tag-list">{skills.map(s=><span className="tag" key={String(s)}>{s}</span>)}</div>}
        {Array.isArray(ind?.languages)&&ind.languages.length>0&&<p><strong>{ar?"اللغات":"Languages"}:</strong> {ind.languages.map(String).join(" · ")}</p>}
        {Array.isArray(ind?.tools)&&ind.tools.length>0&&<p><strong>{ar?"الأدوات":"Tools"}:</strong> {ind.tools.join(" · ")}</p>}
        {Array.isArray(team?.services)&&team.services.length>0&&<p><strong>{ar?"الخدمات":"Services"}:</strong> {team.services.join(" · ")}</p>}
        {Array.isArray(team?.expertise)&&team.expertise.length>0&&<p><strong>{ar?"مجالات الخبرة":"Expertise"}:</strong> {team.expertise.join(" · ")}</p>}
        </article>

        {p.account_type==="team"&&p.team_members?.length>0&&<article className="card"><h2>{ar?"أعضاء الفريق":"Team members"}</h2><div className="member-grid">{p.team_members.map(m=><div className="member-card" key={m.id}><strong>{m.privacy_mode==="anonymous"?(ar?"عضو في الفريق":"Team member"):(m.public_name||(ar?"عضو":"Member"))}</strong><span>{m.professional_title}</span><small className="muted">{m.role}</small>{m.bio&&<p>{m.bio}</p>}</div>)}</div></article>}

        <article className="card"><h2>{ar?"معرض الأعمال":"Portfolio"}</h2>{media.length?<div className="portfolio-grid">{media.map(port=><article className="portfolio-card" key={port.id}><h3>{port.title}</h3><p className="muted">{port.description}</p>{port.portfolio_media?.length>0&&<div className="portfolio-media-grid">{port.portfolio_media.slice(0,3).map(m=>m.media_type==="image"&&m.url?<a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="media-thumb" style={{backgroundImage:"url("+m.url+")"}} aria-label={port.title}/>:m.url?<a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="video-link">▶ {ar?"عرض الفيديو":"View video"}</a>:null)}</div>}</article>)}</div>:<div className="empty">{ar?"لا توجد أعمال منشورة بعد.":"No portfolio work published yet."}</div>}</article>
      </div>

      <aside className="grid">
        <article className="card"><h2>{ar?"إشارات الثقة":"Trust signals"}</h2><ul className="trust-list"><li>✓ {ar?"تم التحقق من الهوية/الموقع عبر GazaWorks":"Identity/location reviewed by GazaWorks"}</li><li>✓ {ar?"التواصل والمشاريع داخل المنصة":"On-platform communication and projects"}</li><li>✓ {ar?"التقييمات مرتبطة بمشاريع مكتملة":"Reviews tied to completed projects"}</li></ul></article>
        <article className="card"><h2>{ar?"التقييمات":"Reviews"}</h2>{reviews?.length?reviews.map((r,i)=><div className="review-row" key={i}><strong>★ {r.overall}/5</strong>{r.feedback&&<p>{r.feedback}</p>}</div>):<div className="empty">{ar?"لا توجد تقييمات بعد.":"No reviews yet."}</div>}</article>
      </aside>
    </div>
  </section>
}

