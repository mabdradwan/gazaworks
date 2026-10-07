import {ProfileForm} from "@/components/forms/profile-form";
import {DocumentImport} from "@/components/forms/document-import";
import {ProfileAvatar} from "@/components/forms/profile-avatar";
import {dashboardPageCopy} from "@/lib/dashboard-page-copy";
import {supabaseServer} from "@/lib/supabase/server";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params,c=dashboardPageCopy(locale,"profile");
  const db=await supabaseServer();const {data:{user}}=await db.auth.getUser();
  const {data:profile}=user?await db.from("profiles").select("account_type").eq("id",user.id).single():{data:null};
  const type=profile?.account_type;
  return <section className="workspace-page">
    <div className="page-heading"><span className="badge">{c.badge}</span><h1>{({ar:"الملف المهني",en:"Professional profile",tr:"Mesleki profil",es:"Perfil profesional",fr:"Profil professionnel",de:"Berufliches Profil"}[locale]??c.title)}</h1><p className="muted">{c.description}</p></div>
    <ProfileAvatar locale={locale}/>
    {type==="individual"&&<DocumentImport kind="individual" locale={locale}/>}
    {type==="team"&&<DocumentImport kind="team" locale={locale}/>}
    <ProfileForm locale={locale}/>
  </section>
}
