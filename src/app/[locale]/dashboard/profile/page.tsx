import {ProfileForm} from "@/components/forms/profile-form";
import {DocumentImport} from "@/components/forms/document-import";
import {supabaseServer} from "@/lib/supabase/server";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  const db=await supabaseServer();const {data:{user}}=await db.auth.getUser();
  const {data:profile}=user?await db.from("profiles").select("account_type").eq("id",user.id).single():{data:null};
  const type=profile?.account_type;
  return <section className="workspace-page">
    <div className="page-heading"><span className="badge">{ar?"إعداد الحساب":"Account setup"}</span><h1>{ar?"الملف المهني":"Professional profile"}</h1><p className="muted">{ar?"أنشئ الملف الذي سيعتمد عليه عملاء GazaWorks وفريق التحقق. تبقى بيانات الاتصال والمعلومات القانونية الخاصة مخفية عن السوق العام.":"Build the profile GazaWorks clients and verification staff will use. Private contact and legal information remain hidden from the public marketplace."}</p></div>
    {type==="individual"&&<DocumentImport kind="individual" locale={locale}/>}
    {type==="team"&&<DocumentImport kind="team" locale={locale}/>}
    <ProfileForm locale={locale}/>
  </section>
}