import {ProfileForm} from "@/components/forms/profile-form";
import {DocumentImport} from "@/components/forms/document-import";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <section className="container grid" style={{padding:"40px 0",maxWidth:900}}><div><h1>Professional profile</h1><p className="muted">Sensitive contact details remain private. Import a CV to create an editable draft, or edit your profile manually.</p></div><DocumentImport kind="individual" locale={locale}/><ProfileForm/></section>}
