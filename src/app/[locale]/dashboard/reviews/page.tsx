import {ReviewsPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"التقييمات":"Reviews"}</h1><p className="muted">{ar?"التقييمات المتبادلة متاحة بعد اكتمال المشروع وتسوية أي نزاع.":"Mutual reviews unlock after project completion and finalized dispute handling."}</p></div><ReviewsPanel locale={locale}/></section>
}
