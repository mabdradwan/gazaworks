import {WorkspaceLink} from "@/components/workspace/workspace-link";
import {NavigationDisclosure} from "@/components/navigation-disclosure";
import {redirect} from "next/navigation";
import {supabaseServer} from "@/lib/supabase/server";
import {WorkspaceSignOut} from "@/components/workspace/workspace-signout";

const routes={
  individual:[["Overview",""],["Profile","profile"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],["Direct Hire","direct-hire"],["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["AI CV Builder","cv-builder"],["Notifications","notifications"]],
  team:[["Overview",""],["Profile","profile"],["Portfolio","portfolio"],["Verification","verification"],["Appointments","appointments"],["Direct Hire","direct-hire"],["Offers","offers"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]],
  client:[["Overview",""],["Profile","profile"],["Find Talent","/talent"],["Saved Talent","favorites"],["Work Requests","work-requests"],["Direct Hire","direct-hire"],["Projects","projects"],["Messages","messages"],["Payments","payments"],["Disputes","disputes"],["Reviews","reviews"],["Notifications","notifications"]]
} as const;
const arLabels:Record<string,string>={Overview:"نظرة عامة",Profile:"الملف الشخصي",Portfolio:"معرض الأعمال",Verification:"التحقق",Appointments:"المواعيد",Offers:"العروض",Projects:"المشاريع",Messages:"الرسائل",Payments:"المدفوعات",Disputes:"النزاعات",Reviews:"التقييمات","AI CV Builder":"منشئ السيرة الذاتية بالذكاء الاصطناعي",Notifications:"الإشعارات","Find Talent":"البحث عن المواهب","Saved Talent":"المواهب المحفوظة","Work Requests":"طلبات العمل","Direct Hire":"طلبات العمل المباشرة"};

export async function WorkspaceShell({locale,children}:{locale:string;children:React.ReactNode}){
  const ar=locale==="ar",db=await supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect(`/${locale}/auth`);
  const {data:profile}=await db.from("profiles").select("account_type,display_name,onboarding_complete,account_status").eq("id",user.id).single();if(!profile)redirect(`/${locale}/auth`);
  if(profile.account_status!=="active")redirect(`/${locale}/auth?error=account_unavailable`);
  const type=profile.account_type as keyof typeof routes,nav=routes[type]??routes.individual;
  let verification:string|null=null;if(type!=="client"){const table=type==="individual"?"individual_profiles":"team_profiles";const key=type==="individual"?"professional_title":"team_name";const {data:v}=await db.from(table).select(`verification_status,${key}`).eq("profile_id",user.id).single();verification=(v as Record<string,unknown>|null)?.verification_status as string|null}
  const accountType=type==="individual"?(ar?"حساب فردي":"individual account"):type==="team"?(ar?"حساب فريق":"team account"):(ar?"حساب عميل":"client account");
  return <div className="workspace-layout">
    <aside className="workspace-sidebar"><div className="workspace-identity"><span className="badge">{accountType}</span><strong>{profile.display_name}</strong><small className="muted">{profile.onboarding_complete?(ar?"الملف مكتمل":"Profile ready"):(ar?"إعداد الملف غير مكتمل":"Profile setup incomplete")}</small>{verification&&<small className="muted">{ar?"التحقق":"Verification"}: {verification.replaceAll("_"," ")}</small>}</div>
      <nav className="workspace-nav">{nav.map(([label,slug])=>{const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;return <WorkspaceLink key={label} href={href}>{ar?(arLabels[label]??label):label}</WorkspaceLink>})}</nav><WorkspaceSignOut locale={locale}/>
    </aside>
    <div className="workspace-main"><NavigationDisclosure className="workspace-mobile-menu" label={ar?"قائمة مساحة العمل":"Workspace menu"} summary={<>{ar?"قائمة مساحة العمل":"Workspace menu"} <span aria-hidden="true">☰</span></>}><div className="workspace-mobile-panel"><div className="workspace-mobile-identity"><strong>{profile.display_name}</strong><small>{accountType}</small></div>{nav.map(([label,slug])=>{const href=slug.startsWith("/")?`/${locale}${slug}`:`/${locale}/dashboard/${slug}`;return <WorkspaceLink key={label} href={href}>{ar?(arLabels[label]??label):label}</WorkspaceLink>})}<WorkspaceSignOut locale={locale}/></div></NavigationDisclosure>{children}</div>
  </div>
}
