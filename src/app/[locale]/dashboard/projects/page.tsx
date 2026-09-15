import {ProjectsPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"المشاريع":"Projects"}</h1><p className="muted">{ar?"أدر الاتفاقيات والتمويل والملفات والتسليم والمراجعات من مكان واحد.":"Manage agreements, funding, files, delivery and review from one place."}</p></div><ProjectsPanel locale={locale}/></section>
}
