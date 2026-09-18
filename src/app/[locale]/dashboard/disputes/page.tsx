import {DisputesPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"النزاعات والاستئناف":"Disputes & appeals"}</h1><p className="muted">{ar?"قدّم الأدلة وتابع قرارات الإدارة. الذكاء الاصطناعي لا يقرر النزاعات.":"Submit evidence and track human administrative decisions. AI never decides disputes."}</p></div><DisputesPanel locale={locale}/></section>
}
