import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";

export async function WorkspaceOverview({locale}:{locale:string}){
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
    ["Projects",projects.count??0,"projects"],
    ["Unread notifications",notifications.count??0,"notifications"],
    ["Conversations",rooms.count??0,"messages"],
    [p.account_type==="client"?"Work requests":"Portfolio",p.account_type==="client"?(requests.count??0):(portfolio.count??0),p.account_type==="client"?"work-requests":"portfolio"]
  ];

  return <section className="workspace-page">
    <div className="workspace-welcome">
      <div><span className="badge">Professional workspace</span><h1>Welcome, {p.display_name}</h1><p className="muted">This is your real GazaWorks account. Complete your profile, then continue through the workflow that matches your account type.</p></div>
      <Link className="btn" href={`/${locale}/dashboard/profile`}>{p.onboarding_complete?"Edit profile":"Complete profile"}</Link>
    </div>

    <div className="dashboard-stats">{cards.map(([label,value,slug])=><Link className="stat-card" key={String(label)} href={`/${locale}/dashboard/${slug}`}><small className="muted">{label}</small><strong>{value}</strong><span>Open →</span></Link>)}</div>

    <div className="dashboard-grid">
      <div className="card">
        <h2>Account status</h2>
        <div className="status-list"><div><span>Profile</span><strong>{p.onboarding_complete?"Ready":"Incomplete"}</strong></div><div><span>Verification</span><strong>{verification}</strong></div><div><span>Account type</span><strong>{p.account_type}</strong></div></div>
      </div>
      <div className="card">
        <h2>Recommended next step</h2>
        {p.account_type==="client"?<><p className="muted">Complete your client profile, discover verified talent, or publish a work request.</p><div className="form-actions"><Link className="btn" href={`/${locale}/talent`}>Find talent</Link><Link className="btn secondary" href={`/${locale}/dashboard/work-requests`}>Post work request</Link></div></>:p.onboarding_complete?<><p className="muted">Your profile has the required core information. Continue to professional verification and book an in-person appointment when slots are available.</p><Link className="btn" href={`/${locale}/dashboard/verification`}>Continue to verification</Link></>:<><p className="muted">Add your professional title, biography, Gaza location, availability, skills, experience and pricing before requesting verification.</p><Link className="btn" href={`/${locale}/dashboard/profile`}>Complete professional profile</Link></>}
      </div>
    </div>
  </section>
}
