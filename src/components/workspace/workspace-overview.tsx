import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";

export async function WorkspaceOverview({locale}:{locale:string}){\n  const ar=locale==="ar";
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return null;
  const {data:p}=await db.from("profiles").select("account_type,display_name,onboarding_complete").eq("id",user.id).single();
  if(!p)return null;

  const [projects,notifications,rooms,portfolio,requests]=await Promise.all([
    db.from("projects").select("id,status",{count:"exact",head:true}).or(`client_id.eq.${user.id},talent_id.eq.${user.id}`),
    db.from("notifications").select("id",{count:"exact",head:true}).eq("profile_id",user.id).is("read_at",null),
    db.from("chat_participants").select("room_id",{count:"exact",head:true}).eq("profile_id",user.id),
    db.from("portfolios").select("id",{count:"exact",head:true}).eq("profile_id",user.id),
    db.from("work_requests").select("id",{count:"exact",head:true}).eq("client_id",user.id)
  ]);

  let verification="not applicable";
  if(p.account_type!=="client"){
    const table=p.account_type==="individual"?"individual_profiles":"team_profiles";
    const {data:v}=await db.from(table).select("verification_status").eq("profile_id",user.id).single();
    verification=String(v?.verification_status??"draft").replaceAll("_"," ");
  }

  const cards=[
    [ar?"المشاريع":"Projects",projects.count??0,"projects"],
    [ar?"الإشعارات غير المقروءة":"Unread notifications",notifications.count??0,"notifications"],
    [ar?"المحادثات":"Conversations",rooms.count??0,"messages"],
    [p.account_type==="client"?(ar?"طلبات العمل":"Work requests"):(ar?"معرض الأعمال":"Portfolio"),p.account_type==="client"?(requests.count??0):(portfolio.count??0),p.account_type==="client"?"work-requests":"portfolio"]
  ];

  return <section className="workspace-page">
    <div className="workspace-welcome">
      <div><span className="badge">{ar?"مساحة عمل احترافية":"Professional workspace"}</span><h1>{ar?"مرحبًا":"Welcome"}, {p.display_name}</h1><p className="muted">{ar?"هذا هو حسابك الحقيقي في GazaWorks. أكمل ملفك ثم تابع مسار العمل المناسب لنوع حسابك.":"This is your real GazaWorks account. Complete your profile, then continue through the workflow that matches your account type."}</p></div>
      <Link className="btn" href={`/${locale}/dashboard/profile`}>{p.onboarding_complete?(ar?"تعديل الملف":"Edit profile"):(ar?"إكمال الملف":"Complete profile")}</Link>
    </div>

    <div className="dashboard-stats">{cards.map(([label,value,slug])=><Link className="stat-card" key={String(label)} href={`/${locale}/dashboard/${slug}`}><small className="muted">{label}</small><strong>{value}</strong><span>{ar?"فتح ←":"Open →"}</span></Link>)}</div>

    <div className="dashboard-grid">
      <div className="card">
        <h2>{ar?"حالة الحساب":"Account status"}</h2>
        <div className="status-list"><div><span>{ar?"الملف":"Profile"}</span><strong>{p.onboarding_complete?(ar?"مكتمل":"Ready"):(ar?"غير مكتمل":"Incomplete")}</strong></div><div><span>{ar?"التحقق":"Verification"}</span><strong>{verification}</strong></div><div><span>{ar?"نوع الحساب":"Account type"}</span><strong>{p.account_type==="individual"?(ar?"فردي":"individual"):p.account_type==="team"?(ar?"فريق":"team"):(ar?"عميل":"client")}</strong></div></div>
      </div>
      <div className="card">
        <h2>{ar?"الخطوة التالية المقترحة":"Recommended next step"}</h2>
        {p.account_type==="client"?<><p className="muted">{ar?"أكمل ملف العميل، وابحث عن المواهب الموثقة، أو انشر طلب عمل.":"Complete your client profile, discover verified talent, or publish a work request."}</p><div className="form-actions"><Link className="btn" href={`/${locale}/talent`}>{ar?"البحث عن المواهب":"Find talent"}</Link><Link className="btn secondary" href={`/${locale}/dashboard/work-requests`}>{ar?"نشر طلب عمل":"Post work request"}</Link></div></>:p.onboarding_complete?<><p className="muted">{ar?"يحتوي ملفك على المعلومات الأساسية المطلوبة. انتقل إلى التحقق المهني واحجز مقابلة حضورية عند توفر المواعيد.":"Your profile has the required core information. Continue to professional verification and book an in-person appointment when slots are available."}</p><Link className="btn" href={`/${locale}/dashboard/verification`}>{ar?"متابعة التحقق":"Continue to verification"}</Link></>:<><p className="muted">{ar?"أضف المسمى المهني والنبذة والموقع داخل غزة والتوفر والمهارات والخبرة والتسعير قبل طلب التحقق.":"Add your professional title, biography, Gaza location, availability, skills, experience and pricing before requesting verification."}</p><Link className="btn" href={`/${locale}/dashboard/profile`}>{ar?"إكمال الملف المهني":"Complete professional profile"}</Link></>}
      </div>
    </div>
  </section>
}
