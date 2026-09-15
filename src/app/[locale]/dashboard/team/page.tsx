import {TeamMembers} from "@/components/forms/team-members";
import {DocumentImport} from "@/components/forms/document-import";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <section className="container grid" style={{padding:"40px 0",maxWidth:900}}><div><h1>Team profile</h1><p className="muted">Import a team PDF/DOCX to create a draft, then control how every member appears to authenticated clients.</p></div><DocumentImport kind="team" locale={locale}/><TeamMembers/></section>}
