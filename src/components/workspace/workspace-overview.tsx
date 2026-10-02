import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";
import {uiCopy} from "@/lib/ui-copy";

export async function WorkspaceOverview({locale}:{locale:string}){
  const c=uiCopy(locale).workspace;
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

  let verification=c.notApplicable;
  if(p.account_type!=="client"){
    const table=p.account_type==="individual"?"individual_profiles":"team_profiles";
    const {data:v}=await db.from(table).select("verification_status").eq("profile_id",user.id).single();
    const raw=String(v?.verification_status??"draft");
    verification=c.status[raw as keyof typeof c.status]??raw.replaceAll("_"," ");
  }

  const cards=[
    [c.projects,projects.count??0,"projects"],
    [c.unreadNotifications,notifications.count??0,"notifications"],
    [c.conversations,rooms.count??0,"messages"],
    [p.account_type==="client"?c.workRequests:c.portfolio,p.account_type==="client"?(requests.count??0):(portfolio.count??0),p.account_type==="client"?"work-requests":"portfolio"]
  ] as const;

  return <section className="workspace-page">
    <div className="workspace-welcome">
      <div><span className="badge">{c.professionalWorkspace}</span><h1>{c.welcome}, {p.display_name}</h1><p className="muted">{c.welcomeBody}</p></div>
      <Link className="btn" href={`/${locale}/dashboard/profile`}>{p.onboarding_complete?c.editProfile:c.completeProfile}</Link>
    </div>

    <div className="dashboard-stats">{cards.map(([label,value,slug])=><Link className="stat-card" key={String(label)} href={`/${locale}/dashboard/${slug}`}><small className="muted">{label}</small><strong>{value}</strong><span>{c.open}</span></Link>)}</div>

    <div className="dashboard-grid">
      <div className="card">
        <h2>{c.accountStatus}</h2>
        <div className="status-list">
          <div><span>{c.profile}</span><strong>{p.onboarding_complete?c.ready:c.incomplete}</strong></div>
          <div><span>{c.verification}</span><strong>{verification}</strong></div>
          <div><span>{c.accountType}</span><strong>{p.account_type==="individual"?c.individual:p.account_type==="team"?c.team:c.client}</strong></div>
        </div>
      </div>
      <div className="card">
        <h2>{c.recommended}</h2>
        {p.account_type==="client"?<>
          <p className="muted">{c.clientNext}</p>
          <div className="form-actions"><Link className="btn" href={`/${locale}/talent`}>{c.findTalent}</Link><Link className="btn secondary" href={`/${locale}/dashboard/work-requests`}>{c.postWorkRequest}</Link></div>
        </>:p.onboarding_complete?<>
          <p className="muted">{c.verifiedNext}</p>
          <Link className="btn" href={`/${locale}/dashboard/verification`}>{c.continueVerification}</Link>
        </>:<>
          <p className="muted">{c.profileNext}</p>
          <Link className="btn" href={`/${locale}/dashboard/profile`}>{c.completeProfessionalProfile}</Link>
        </>}
      </div>
    </div>
  </section>
}
