import {ReviewsPanel} from "@/components/workspace/resource-panels";
import {dashboardPageCopy} from "@/lib/dashboard-page-copy";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params,c=dashboardPageCopy(locale,"reviews");
  return <section className="workspace-page"><div className="page-heading"><h1>{c.title}</h1><p className="muted">{c.description}</p></div><ReviewsPanel locale={locale}/></section>
}
