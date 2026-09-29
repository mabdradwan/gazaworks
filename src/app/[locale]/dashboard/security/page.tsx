import {SecurityHistory} from "@/components/workspace/security-history";
import {dashboardPageCopy} from "@/lib/dashboard-page-copy";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params,c=dashboardPageCopy(locale,"security");return <section className="workspace-page"><div className="page-heading"><h1>{c.title}</h1><p className="muted">{c.description}</p></div><SecurityHistory locale={locale}/></section>}
