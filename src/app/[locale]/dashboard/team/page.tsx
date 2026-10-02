import {TeamMembers} from "@/components/forms/team-members";
import {dashboardPageCopy} from "@/lib/dashboard-page-copy";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params,c=dashboardPageCopy(locale,"team");return <section className="workspace-page"><div className="page-heading"><span className="badge">{c.badge}</span><h1>{c.title}</h1><p className="muted">{c.description}</p></div><TeamMembers locale={locale}/></section>}
