import {ProfileForm} from "@/components/forms/profile-form";
import {DocumentImport} from "@/components/forms/document-import";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  return <section className="workspace-page"><div className="page-heading"><span className="badge">Account setup</span><h1>Professional profile</h1><p className="muted">Build the profile GazaWorks clients and verification staff will use. Private contact and legal information remain hidden from the public marketplace.</p></div><DocumentImport kind="individual" locale={locale}/><ProfileForm locale={locale}/></section>
}
