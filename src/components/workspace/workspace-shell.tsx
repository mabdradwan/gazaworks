import Link from "next/link";
import {redirect} from "next/navigation";
import {supabaseServer} from "@/lib/supabase/server";
import {WorkspaceSignOut} from "@/components/workspace/workspace-signout";

const routes={
  individual:[
    ["Overview",""],["Profile","profile"],["Team Members","team"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],
    ["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],
    ["AI CV Builder","cv-builder"],["Notifications","notifications"]
  ],
  team:[
    ["Overview",""],["Profile","profile"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],
    ["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]
  ],
  client:[
    ["Overview",""],["Profile","profile"],["Find Talent","/talent"],["Saved Talent","favorites"],["Work Requests","work-requests"],
    ["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]
  ]
} as const;

export async function WorkspaceShell({locale,children}:{locale:string;children:React.ReactNode}){
  const db=await supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect(`/${locale}/auth`);
  const {data:profile}=await db.from("profiles").select("account_type,display_name,onboarding_complete,account_status").eq("id",user.id).single();
  if(!profile)redirect(`/${locale}/auth`);
  const type=profile.account_type as keyof typeof routes;
  const nav=routes[type]??routes.individual;
  let verification:string|null=null;
  if(type!=="client"){
    const table=type==="individual"?"individual_profiles":"team_profiles";
    const key=type==="individual"?"professional_title":"team_name";
    const {data:v}=await db.from(table).select(`verification_status,${key}`).eq("profile_id",user.id).single();
    verification=(v as Record<string,unknown>|null)?.verification_status as string|null;
  }

  return <div className="workspace-layout">
    <aside className="workspace-sidebar">
      <div className="workspace-identity">
        <span className="badge">{type}</span>
        <strong>{profile.display_name}</strong>
        <small className="muted">{profile.onboarding_complete?"Profile ready":"Profile setup incomplete"}</small>
        {verification&&<small className="muted">Verification: {verification.replaceAll("_"," ")}</small>}
      </div>
      <nav className="workspace-nav">{nav.map(([label,slug])=>{
        const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;
        return <Link key={label} href={href}>{label}</Link>
      })}</nav>
      <WorkspaceSignOut locale={locale}/>
    </aside>

    <div className="workspace-main">
      <details className="workspace-mobile-menu">
        <summary>Workspace menu <span>☰</span></summary>
        <div className="workspace-mobile-panel">
          <div className="workspace-mobile-identity"><strong>{profile.display_name}</strong><small>{type} account</small></div>
          {nav.map(([label,slug])=>{
            const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;
            return <Link key={label} href={href}>{label}</Link>
          })}
          <WorkspaceSignOut locale={locale}/>
        </div>
      </details>
      {children}
    </div>
  </div>
}
