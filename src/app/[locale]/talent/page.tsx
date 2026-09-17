import {TalentSearch} from "@/components/talent/search";
import {AIAssistant} from "@/components/ai-assistant";
import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";
import {directoryAccess} from "@/lib/directory";
import {authCopy} from "@/lib/auth-copy";
export const metadata={robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params,t=authCopy(locale),ar=locale==="ar";
 const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
 if(!user||!await directoryAccess()){
  const next=encodeURIComponent(`/${locale}/talent`);
  return <section className="container auth-wrap"><div className="card grid"><h1>{t.directoryTitle}</h1><p className="muted">{user?t.directoryClient:t.directoryLogin}</p><div className="form-actions">{user?<Link className="btn" href={`/${locale}/dashboard`}>{t.workspace}</Link>:<><Link className="btn" href={`/${locale}/auth?next=${next}`}>{t.signIn}</Link><Link className="btn secondary" href={`/${locale}/auth?mode=register&next=${next}`}>{t.create}</Link></>}</div></div></section>;
 }
 return <section className="container grid talent-search-page"><div className="page-heading"><span className="badge">{ar?"مواهب موثقة فقط":"Verified talent only"}</span><h1>{ar?"اعثر على المحترف أو الفريق المناسب":"Find the right Gaza professional or team"}</h1><p className="muted">{ar?"ابحث داخل قاعدة مواهب GazaWorks الموثقة باستخدام المهارات والخبرة والتقييم والتوفر والميزانية.":"Search the verified GazaWorks directory by skills, experience, rating, availability and budget."}</p></div><AIAssistant locale={locale} mode="talent_search"/><TalentSearch locale={locale}/></section>;
}
