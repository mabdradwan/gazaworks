import {MessagesPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"الرسائل":"Messages"}</h1><p className="muted">{ar?"أبقِ التواصل والملفات والرسائل الصوتية داخل GazaWorks للحماية والمساءلة.":"Keep text, files and voice messages inside GazaWorks for protection and accountability."}</p></div><MessagesPanel locale={locale}/></section>
}
