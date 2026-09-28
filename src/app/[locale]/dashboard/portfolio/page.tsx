import {PortfolioPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"معرض الأعمال":"Portfolio"}</h1><p className="muted">{ar?"اعرض مشاريعك داخل GazaWorks وأضف الصور والفيديوهات والمهارات المستخدمة.":"Host your work inside GazaWorks with project details, images, videos and skills."}</p></div><PortfolioPanel locale={locale}/></section>
}
