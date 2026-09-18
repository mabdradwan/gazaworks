import {DirectHirePanel} from "@/components/workspace/direct-hire-panel";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"طلبات العمل المباشرة":"Direct work requests"}</h1><p className="muted">{ar?"تابع طلبات التوظيف الخاصة المرسلة أو المستلمة، واقبلها أو ارفضها من داخل GazaWorks.":"Manage private direct-hire requests sent or received inside GazaWorks."}</p></div><DirectHirePanel locale={locale}/></section>
}