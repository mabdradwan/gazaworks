import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";

export async function CmsPage({slug,locale,fallbackTitle,fallbackDescription}:{slug:string;locale:string;fallbackTitle:string;fallbackDescription:string}){
  const db=await supabaseServer();
  const {data:page}=await db.from("site_pages").select("id,status,site_translations(locale,title,content)").eq("slug",slug).eq("status","published").maybeSingle();
  const translations=(page?.site_translations??[]) as {locale:string;title:string;content:{body?:string}}[];
  const tr=translations.find(x=>x.locale===locale)??translations.find(x=>x.locale==="en");
  const title=tr?.title??fallbackTitle,body=tr?.content?.body??fallbackDescription;
  return <><section style={{padding:"72px 0",background:"var(--sand)"}}><div className="container"><span className="badge">GazaWorks</span><h1 style={{fontSize:50,letterSpacing:"-.04em",maxWidth:760}}>{title}</h1><p className="muted" style={{fontSize:19,maxWidth:760,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{body}</p></div></section><section className="container" style={{padding:"60px 0"}}><div className="card"><h2>Professional marketplace standards</h2><p className="muted">GazaWorks keeps verification, project records, communication, delivery and payment status in one accountable workflow.</p></div><div className="card" style={{marginTop:40,background:"var(--brand)",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap"}}><h2>Ready to work together?</h2><Link className="btn" style={{background:"white",color:"var(--brand)"}} href={"/"+locale+"/auth?mode=register"}>Join GazaWorks</Link></div></section></>
}
