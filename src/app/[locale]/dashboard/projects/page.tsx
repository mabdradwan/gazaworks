import Link from "next/link";
import {ProjectsPanel} from "@/components/workspace/panels/projects-panel";
import {WorkRequestForm} from "@/components/forms/work-request-form";
import {dashboardPageCopy} from "@/lib/dashboard-page-copy";
import {supabaseServer} from "@/lib/supabase/server";
import {projectsEntryCopy} from "@/lib/projects-entry-copy";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params,c=dashboardPageCopy(locale,"projects"),entry=projectsEntryCopy(locale);
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 const {data:profile}=user?await db.from("profiles").select("account_type,onboarding_complete").eq("id",user.id).single():{data:null};
 return <section className="workspace-page"><div className="page-heading"><h1>{c.title}</h1><p className="muted">{c.description}</p></div>
 {profile&&!profile.onboarding_complete&&<div className="card profile-hint"><p>{entry.completeHint}</p><Link className="btn secondary" href={`/${locale}/dashboard/professional`}>{entry.completeProfile}</Link></div>}
 {profile?.account_type==="client"&&<details className="card projects-create"><summary>{entry.addProject}</summary><p className="muted">{entry.createHint}</p><WorkRequestForm locale={locale}/></details>}
 <ProjectsPanel locale={locale}/></section>
}
