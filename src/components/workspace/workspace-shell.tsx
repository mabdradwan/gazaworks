import {WorkspaceLink} from "@/components/workspace/workspace-link";
import {NavigationDisclosure} from "@/components/navigation-disclosure";
import {redirect} from "next/navigation";
import {supabaseServer} from "@/lib/supabase/server";
import {WorkspaceSignOut} from "@/components/workspace/workspace-signout";
import {workspaceCopy} from "@/lib/workspace-copy";
import {appointmentState} from "@/lib/appointment-copy";

const routes={
  individual:[["Overview",""],["Profile","profile"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],["Direct Hire","direct-hire"],["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["AI CV Builder","cv-builder"],["Notifications","notifications"]],
  team:[["Overview",""],["Profile","profile"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],["Direct Hire","direct-hire"],["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]],
  client:[["Overview",""],["Profile","profile"],["Find Talent","/talent"],["Saved Talent","favorites"],["Work Requests","work-requests"],["Direct Hire","direct-hire"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]]
} as const;

export async function WorkspaceShell({locale,children}:{locale:string;children:React.ReactNode}){
  const c=workspaceCopy(locale),db=await supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect(`/${locale}/auth`);
  const {data:profile}=await db.from("profiles").select("account_type,display_name,onboarding_complete,account_status").eq("id",user.id).single();if(!profile)redirect(`/${locale}/auth`);
  if(profile.account_status!=="active")redirect(`/${locale}/auth?error=account_unavailable`);
  const type=profile.account_type as keyof typeof routes,nav=routes[type]??routes.individual;
  let verification:string|null=null;if(type!=="client"){const table=type==="individual"?"individual_profiles":"team_profiles";const key=type==="individual"?"professional_title":"team_name";const {data:v}=await db.from(table).select(`verification_status,${key}`).eq("profile_id",user.id).single();verification=(v as Record<string,unknown>|null)?.verification_status as string|null}
  const accountType=type==="individual"?c.individual:type==="team"?c.team:c.client;
  return <div className="workspace-layout">
    <aside className="workspace-sidebar"><div className="workspace-identity"><span className="badge">{accountType}</span><strong>{profile.display_name}</strong><small className="muted">{profile.onboarding_complete?c.ready:c.incomplete}</small>{verification&&<small className="muted">{c.label("Verification")}: {appointmentState(locale,verification)}</small>}</div>
      <nav className="workspace-nav" aria-label={c.menu}>{nav.map(([label,slug])=>{const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;return <WorkspaceLink key={label} href={href}>{c.label(label)}</WorkspaceLink>})}<WorkspaceLink href={`/${locale}/dashboard/security`}>{c.label("Security")}</WorkspaceLink></nav><WorkspaceSignOut locale={locale}/>
    </aside>
    <div className="workspace-main"><NavigationDisclosure className="workspace-mobile-menu" label={c.menu} summary={<>{c.menu} <span aria-hidden="true">☰</span></>}><div className="workspace-mobile-panel"><div className="workspace-mobile-identity"><strong>{profile.display_name}</strong><small>{accountType}</small></div>{nav.map(([label,slug])=>{const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;return <WorkspaceLink key={label} href={href}>{c.label(label)}</WorkspaceLink>})}<WorkspaceLink href={`/${locale}/dashboard/security`}>{c.label("Security")}</WorkspaceLink><WorkspaceSignOut locale={locale}/></div></NavigationDisclosure>{children}</div>
  </div>
}
