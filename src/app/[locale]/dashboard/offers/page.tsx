import {OffersPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"العروض":"Offers"}</h1><p className="muted">{ar?"العروض خاصة؛ لا يرى المحترفون أسعار المنافسين أو تفاصيل عروضهم.":"Offers are private; professionals cannot see competitors’ prices or proposals."}</p></div><OffersPanel locale={locale}/></section>
}
